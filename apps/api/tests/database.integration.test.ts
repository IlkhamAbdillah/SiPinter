import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTransaction } from "../src/config/database.js";
import { DATABASE_DIR, runMigrations, runSeeds } from "../src/db/sql-runner.js";
import { hasTestDatabase, testDatabaseUrl } from "./helpers/test-database.js";

// Runs the real migrations and seeds against a disposable PostgreSQL database (see helpers/test-database.ts).
describe.skipIf(!hasTestDatabase)("database migrations and seeds (integration)", () => {
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: testDatabaseUrl, max: 3 });
    await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("applies the initial schema once and is idempotent afterwards", async () => {
    expect(await runMigrations(pool)).toEqual([
      "0001_initial_schema.sql",
      "0002_auth_sessions.sql",
      "0003_question_types_and_sheet_status.sql",
    ]);
    expect(await runMigrations(pool)).toEqual([]);

    const { rows } = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    expect(rows.map((row) => row.table_name)).toEqual([
      "answer_keys",
      "answer_sheets",
      "answers",
      "exams",
      "questions",
      "schema_migrations",
      "scores",
      "sessions",
      "students",
      "users",
    ]);
  });

  it("refuses to continue when an applied migration file was edited", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "sipinter-migrations-"));
    try {
      const original = await readFile(path.join(DATABASE_DIR, "migrations", "0001_initial_schema.sql"), "utf8");
      await writeFile(path.join(dir, "0001_initial_schema.sql"), `${original}\n-- edited`);
      await expect(runMigrations(pool, dir)).rejects.toThrow(/was modified after it was applied/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("seeds repeatably", async () => {
    await runSeeds(pool);
    await runSeeds(pool);

    const counts = await pool.query<Record<string, number>>(`
      SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM students) AS students,
        (SELECT count(*)::int FROM exams) AS exams,
        (SELECT count(*)::int FROM questions) AS questions,
        (SELECT count(*)::int FROM answer_keys) AS answer_keys,
        (SELECT count(*)::int FROM answer_sheets) AS answer_sheets,
        (SELECT count(*)::int FROM answers) AS answers,
        (SELECT count(*)::int FROM scores) AS scores
    `);
    expect(counts.rows[0]).toEqual({
      users: 3,
      students: 10,
      exams: 3,
      questions: 15,
      answer_keys: 15,
      answer_sheets: 6,
      answers: 30,
      scores: 6,
    });
  });

  it("enforces one answer per question per answer sheet", async () => {
    await expect(
      pool.query("INSERT INTO answers (answer_sheet_id, question_id, student_answer_text) VALUES (1, 1, 'dup')"),
    ).rejects.toMatchObject({ code: "23505" }); // unique_violation
  });

  it("enforces a 1:1 answer sheet to score relationship and the 0-100 range", async () => {
    await expect(pool.query("INSERT INTO scores (answer_sheet_id, score) VALUES (1, 50)")).rejects.toMatchObject({
      code: "23505",
    });
    await expect(pool.query("UPDATE scores SET score = 101 WHERE answer_sheet_id = 1")).rejects.toMatchObject({
      code: "23514", // check_violation
    });
  });

  it("allows only one answer sheet per student per exam", async () => {
    await expect(
      pool.query("INSERT INTO answer_sheets (exam_id, student_id) VALUES (1, '240001')"),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("rolls back every statement in a failed transaction", async () => {
    await expect(
      withTransaction(pool, async (client) => {
        await client.query("DELETE FROM scores WHERE answer_sheet_id = 1");
        await client.query("INSERT INTO scores (answer_sheet_id, score) VALUES (1, 150)"); // violates check
      }),
    ).rejects.toMatchObject({ code: "23514" });

    const { rowCount } = await pool.query("SELECT 1 FROM scores WHERE answer_sheet_id = 1");
    expect(rowCount).toBe(1);
  });

  it("only allows lecturer/admin roles and lowercase emails", async () => {
    await expect(
      pool.query("INSERT INTO users (name, email, role, password) VALUES ('X', 'x@example.com', 'student', 'h')"),
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      pool.query("INSERT INTO users (name, email, role, password) VALUES ('X', 'Budi.Santoso@example.com', 'lecturer', 'h')"),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("cascades deletes from an exam to its questions, sheets, answers and scores", async () => {
    await pool.query("DELETE FROM exams WHERE exam_id = 1");
    const { rows } = await pool.query<{ remaining: number }>(`
      SELECT
        (SELECT count(*)::int FROM questions WHERE exam_id = 1)
        + (SELECT count(*)::int FROM answer_sheets WHERE exam_id = 1)
        + (SELECT count(*)::int FROM answers WHERE answer_sheet_id IN (1, 2, 3))
        + (SELECT count(*)::int FROM scores WHERE answer_sheet_id IN (1, 2, 3)) AS remaining
    `);
    expect(rows[0]?.remaining).toBe(0);
  });
});
