import type { Queryable } from "../../config/database.js";
import type { CreateExamInput, UpdateExamInput } from "./exams.schema.js";
import type { Exam, ExamSummary } from "./exams.types.js";

const EXAM_COLUMNS = "e.exam_id, e.lecturer_id, e.exam_name, e.exam_date::text AS exam_date";

const SUMMARY_QUERY = `
  SELECT ${EXAM_COLUMNS},
         u.name AS lecturer_name,
         (SELECT count(*)::int FROM questions q WHERE q.exam_id = e.exam_id) AS question_count,
         (SELECT count(*)::int FROM answer_sheets s WHERE s.exam_id = e.exam_id) AS answer_sheet_count,
         (SELECT count(*)::int
            FROM answer_sheets s
            JOIN scores sc ON sc.answer_sheet_id = s.answer_sheet_id
           WHERE s.exam_id = e.exam_id) AS graded_count
    FROM exams e
    JOIN users u ON u.lecturer_id = e.lecturer_id`;

/** `lecturerId` null lists every lecturer's exams (admins). */
export async function listExams(db: Queryable, lecturerId: number | null): Promise<ExamSummary[]> {
  const { rows } = await db.query<ExamSummary>(
    `${SUMMARY_QUERY} WHERE ($1::int IS NULL OR e.lecturer_id = $1) ORDER BY e.exam_date DESC, e.exam_id DESC`,
    [lecturerId],
  );
  return rows;
}

export async function findExam(db: Queryable, examId: number): Promise<Exam | undefined> {
  const { rows } = await db.query<Exam>(`SELECT ${EXAM_COLUMNS} FROM exams e WHERE e.exam_id = $1`, [examId]);
  return rows[0];
}

export async function findExamSummary(db: Queryable, examId: number): Promise<ExamSummary | undefined> {
  const { rows } = await db.query<ExamSummary>(`${SUMMARY_QUERY} WHERE e.exam_id = $1`, [examId]);
  return rows[0];
}

export async function insertExam(db: Queryable, lecturerId: number, input: CreateExamInput): Promise<number> {
  const { rows } = await db.query<{ exam_id: number }>(
    "INSERT INTO exams (lecturer_id, exam_name, exam_date) VALUES ($1, $2, $3) RETURNING exam_id",
    [lecturerId, input.exam_name, input.exam_date],
  );
  return rows[0]!.exam_id;
}

export async function updateExam(db: Queryable, examId: number, input: UpdateExamInput): Promise<void> {
  await db.query(
    `UPDATE exams
        SET exam_name = COALESCE($2, exam_name),
            exam_date = COALESCE($3::date, exam_date)
      WHERE exam_id = $1`,
    [examId, input.exam_name ?? null, input.exam_date ?? null],
  );
}

export async function deleteExam(db: Queryable, examId: number): Promise<void> {
  await db.query("DELETE FROM exams WHERE exam_id = $1", [examId]);
}
