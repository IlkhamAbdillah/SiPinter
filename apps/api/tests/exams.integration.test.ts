import type pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createSeededTestDatabase, hasTestDatabase } from "./helpers/test-database.js";

const ORIGIN = "http://localhost:3000";
const DEV_PASSWORD = "sipinter-dev";
// Seed data: Budi owns exams 1 and 2, Siti owns exam 3, Andi is an admin.
const BUDI = "budi.santoso@example.com";
const SITI = "siti.rahmawati@example.com";
const ADMIN = "andi.pratama@example.com";

describe.skipIf(!hasTestDatabase)("exams, questions and answer sheets API (integration)", () => {
  let pool: pg.Pool;
  let app: ReturnType<typeof createApp>;
  const cookies: Record<string, string> = {};

  beforeAll(async () => {
    pool = await createSeededTestDatabase();
    app = createApp({ db: pool, corsOrigins: [], appOrigin: ORIGIN });
    for (const email of [BUDI, SITI, ADMIN]) {
      const res = await request(app).post("/api/auth/login").set("Origin", ORIGIN).send({ email, password: DEV_PASSWORD });
      cookies[email] = (res.headers["set-cookie"] as unknown as string[])[0]!.split(";")[0]!;
    }
  });

  afterAll(async () => {
    await pool?.end();
  });

  const get = (path: string, as: string) => request(app).get(path).set("Cookie", cookies[as]!);
  const post = (path: string, as: string, body: object) =>
    request(app).post(path).set("Origin", ORIGIN).set("Cookie", cookies[as]!).send(body);
  const patch = (path: string, as: string, body: object) =>
    request(app).patch(path).set("Origin", ORIGIN).set("Cookie", cookies[as]!).send(body);
  const del = (path: string, as: string) => request(app).delete(path).set("Origin", ORIGIN).set("Cookie", cookies[as]!);

  describe("exams", () => {
    it("requires login", async () => {
      expect((await request(app).get("/api/exams")).status).toBe(401);
      expect((await request(app).get("/api/answer-sheets/1")).status).toBe(401);
      expect((await request(app).get("/api/students")).status).toBe(401);
    });

    it("lists only the lecturer's own exams, with counts", async () => {
      const res = await get("/api/exams", BUDI);
      expect(res.status).toBe(200);
      expect(res.body.data.map((exam: { exam_id: number }) => exam.exam_id)).toEqual([2, 1]);
      expect(res.body.data[1]).toEqual({
        exam_id: 1,
        lecturer_id: 1,
        lecturer_name: "Budi Santoso",
        exam_name: "Ujian Basis Data",
        exam_date: "2026-10-01",
        question_count: 5,
        answer_sheet_count: 3,
        graded_count: 3,
      });
    });

    it("lets admins see every exam", async () => {
      const res = await get("/api/exams", ADMIN);
      expect(res.body.data.map((exam: { exam_id: number }) => exam.exam_id).sort()).toEqual([1, 2, 3]);
      expect((await get("/api/exams/3", ADMIN)).status).toBe(200);
    });

    it("hides other lecturers' exams behind the same 404 as a missing exam", async () => {
      for (const path of ["/api/exams/3", "/api/exams/9999", "/api/exams/3/questions", "/api/exams/3/answer-sheets"]) {
        const res = await get(path, BUDI);
        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("EXAM_NOT_FOUND");
      }
      expect((await patch("/api/exams/3", BUDI, { exam_name: "Hijacked" })).status).toBe(404);
      expect((await del("/api/exams/3", BUDI)).status).toBe(404);
      const { rows } = await pool.query("SELECT exam_name FROM exams WHERE exam_id = 3");
      expect(rows[0].exam_name).toBe("Ujian Rekayasa Perangkat Lunak");
    });

    it("rejects invalid ids and bodies", async () => {
      expect((await get("/api/exams/abc", BUDI)).body.error.code).toBe("VALIDATION_ERROR");
      expect((await get("/api/exams/99999999999", BUDI)).body.error.code).toBe("VALIDATION_ERROR");
      expect((await post("/api/exams", BUDI, { exam_name: " ", exam_date: "2026-02-30" })).status).toBe(400);
      expect((await patch("/api/exams/1", BUDI, {})).status).toBe(400);
    });

    it("creates, updates and deletes an exam owned by the creator", async () => {
      const created = await post("/api/exams", SITI, { exam_name: "  Ujian Jaringan ", exam_date: "2026-11-02" });
      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({
        lecturer_id: 2,
        exam_name: "Ujian Jaringan",
        exam_date: "2026-11-02",
        question_count: 0,
      });
      const path = `/api/exams/${created.body.data.exam_id}`;

      const updated = await patch(path, SITI, { exam_date: "2026-11-03" });
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ exam_name: "Ujian Jaringan", exam_date: "2026-11-03" });

      expect((await del(path, SITI)).status).toBe(204);
      expect((await get(path, SITI)).status).toBe(404);
    });

    it("rejects writes from another origin (CSRF)", async () => {
      const res = await request(app)
        .post("/api/exams")
        .set("Origin", "https://evil.example")
        .set("Cookie", cookies[BUDI]!)
        .send({ exam_name: "x", exam_date: "2026-01-01" });
      expect(res.status).toBe(403);
    });
  });

  describe("questions", () => {
    it("lists an exam's questions in order, with answer keys", async () => {
      const res = await get("/api/exams/1/questions", BUDI);
      expect(res.status).toBe(200);
      expect(res.body.data.map((q: { question_number: number }) => q.question_number)).toEqual([1, 2, 3, 4, 5]);
      expect(res.body.data[0]).toMatchObject({
        question_id: 1,
        question_type: "essay",
        answer_key: { correct_answer: expect.any(String), keywords: "primary key,foreign key,unik,referensi" },
      });
    });

    it("creates a question together with its answer key", async () => {
      const res = await post("/api/exams/1/questions", BUDI, {
        question_number: 6,
        question_type: "multiple_choice",
        question_text: "Perintah SQL untuk mengambil data adalah ...",
        answer_key: { correct_answer: "B", keywords: "" },
      });
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        exam_id: 1,
        question_number: 6,
        answer_key: { correct_answer: "B", keywords: null },
      });
    });

    it("rejects unknown question types and duplicate numbers", async () => {
      const base = { question_number: 1, question_text: "Soal" };
      expect((await post("/api/exams/1/questions", BUDI, { ...base, question_type: "true_false" })).status).toBe(400);

      const duplicate = await post("/api/exams/1/questions", BUDI, { ...base, question_type: "essay" });
      expect(duplicate.status).toBe(409);
      expect(duplicate.body.error.code).toBe("QUESTION_NUMBER_TAKEN");
    });

    it("rolls back the question when its answer key cannot be saved", async () => {
      // The question insert succeeds, then the answer key violates a database constraint.
      await pool.query("ALTER TABLE answer_keys ADD CONSTRAINT test_reject_key CHECK (correct_answer <> 'REJECT')");
      try {
        const res = await post("/api/exams/2/questions", BUDI, {
          question_number: 50,
          question_type: "short_answer",
          question_text: "Soal",
          answer_key: { correct_answer: "REJECT" },
        });
        expect(res.status).toBe(500);
        const { rowCount } = await pool.query("SELECT 1 FROM questions WHERE exam_id = 2 AND question_number = 50");
        expect(rowCount).toBe(0);
      } finally {
        await pool.query("ALTER TABLE answer_keys DROP CONSTRAINT test_reject_key");
      }
    });

    it("updates fields, replaces and removes the answer key", async () => {
      const created = await post("/api/exams/2/questions", BUDI, {
        question_number: 6,
        question_type: "short_answer",
        question_text: "Struktur data LIFO adalah ...",
      });
      expect(created.body.data.answer_key).toBeNull();
      const path = `/api/exams/2/questions/${created.body.data.question_id}`;

      const withKey = await patch(path, BUDI, { answer_key: { correct_answer: "stack", keywords: "stack,lifo" } });
      expect(withKey.status).toBe(200);
      expect(withKey.body.data).toMatchObject({
        question_text: "Struktur data LIFO adalah ...",
        answer_key: { correct_answer: "stack", keywords: "stack,lifo" },
      });

      const renamed = await patch(path, BUDI, { question_text: "Struktur data LIFO disebut ..." });
      expect(renamed.body.data.answer_key).toEqual({ correct_answer: "stack", keywords: "stack,lifo" });

      const withoutKey = await patch(path, BUDI, { answer_key: null });
      expect(withoutKey.body.data.answer_key).toBeNull();

      expect((await del(path, BUDI)).status).toBe(204);
      expect((await get(path, BUDI)).status).toBe(404);
    });

    it("does not reach a question through a different exam", async () => {
      // Question 11 belongs to exam 3, not exam 1.
      expect((await get("/api/exams/1/questions/11", BUDI)).status).toBe(404);
      expect((await patch("/api/exams/1/questions/11", BUDI, { question_text: "x" })).status).toBe(404);
      expect((await del("/api/exams/1/questions/11", BUDI)).status).toBe(404);
    });
  });

  describe("answer sheets and results", () => {
    it("lists an exam's answer sheets with student names and scores", async () => {
      const res = await get("/api/exams/1/answer-sheets", BUDI);
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toEqual({
        answer_sheet_id: 1,
        exam_id: 1,
        student_id: "240001",
        student_name: "Muhammad Rizky",
        verification_status: "verified",
        has_file: true,
        score: 88.5,
      });
      expect(JSON.stringify(res.body)).not.toContain("dummy/exams");
    });

    it("shows a sheet with every question and the student's answers", async () => {
      const res = await get("/api/answer-sheets/1", BUDI);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ answer_sheet_id: 1, exam_name: "Ujian Basis Data", score: 88.5 });
      expect(res.body.data).not.toHaveProperty("lecturer_id");
      expect(res.body.data.answers[0]).toMatchObject({
        question_number: 1,
        answer_id: expect.any(Number),
        student_answer_text: expect.stringContaining("Primary key"),
      });
    });

    it("hides other lecturers' answer sheets", async () => {
      // Sheet 6 belongs to Siti's exam.
      for (const res of [
        await get("/api/answer-sheets/6", BUDI),
        await patch("/api/answer-sheets/6", BUDI, { verification_status: "pending" }),
        await del("/api/answer-sheets/6", BUDI),
      ]) {
        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("ANSWER_SHEET_NOT_FOUND");
      }
      expect((await get("/api/answer-sheets/6", ADMIN)).status).toBe(200);
    });

    it("registers a sheet once per student and exam", async () => {
      const created = await post("/api/exams/1/answer-sheets", BUDI, { student_id: "240004" });
      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({
        exam_id: 1,
        student_id: "240004",
        verification_status: "pending",
        has_file: false,
        score: null,
      });

      const duplicate = await post("/api/exams/1/answer-sheets", BUDI, { student_id: "240004" });
      expect(duplicate.status).toBe(409);
      expect(duplicate.body.error.code).toBe("ANSWER_SHEET_EXISTS");

      const unknown = await post("/api/exams/1/answer-sheets", BUDI, { student_id: "999999" });
      expect(unknown.status).toBe(422);
      expect(unknown.body.error.code).toBe("UNKNOWN_STUDENT");
    });

    it("only verifies a sheet that has been graded", async () => {
      const created = await post("/api/exams/2/answer-sheets", BUDI, { student_id: "240005" });
      const path = `/api/answer-sheets/${created.body.data.answer_sheet_id}`;

      const ungraded = await patch(path, BUDI, { verification_status: "verified" });
      expect(ungraded.status).toBe(409);
      expect(ungraded.body.error.code).toBe("ANSWER_SHEET_NOT_GRADED");

      const detail = await get(path, BUDI);
      expect(detail.body.data.answers.every((a: { answer_id: number | null }) => a.answer_id === null)).toBe(true);

      expect((await del(path, BUDI)).status).toBe(204);
      expect((await get(path, BUDI)).status).toBe(404);
    });

    it("lets the lecturer mark a graded sheet as verified or back to pending", async () => {
      const verified = await patch("/api/answer-sheets/3", BUDI, { verification_status: "verified" });
      expect(verified.status).toBe(200);
      expect(verified.body.data.verification_status).toBe("verified");

      const reopened = await patch("/api/answer-sheets/3", BUDI, { verification_status: "pending" });
      expect(reopened.body.data.verification_status).toBe("pending");

      expect((await patch("/api/answer-sheets/3", BUDI, { verification_status: "done" })).status).toBe(400);
    });
  });

  describe("students", () => {
    it("lists students without their email addresses", async () => {
      const res = await get("/api/students", BUDI);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.data[0]).toEqual({
        student_id: "240001",
        name: "Muhammad Rizky",
        study_program: "Informatika",
        enrollment_year: 2024,
      });
    });
  });
});
