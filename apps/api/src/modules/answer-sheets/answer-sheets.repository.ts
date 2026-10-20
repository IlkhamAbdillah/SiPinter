import type { Queryable } from "../../config/database.js";
import type { AnswerSheetSummary, SheetAnswer, VerificationStatus } from "./answer-sheets.types.js";

const SUMMARY_COLUMNS = `
  s.answer_sheet_id, s.exam_id, s.student_id, st.name AS student_name, s.verification_status,
  (s.file_path IS NOT NULL) AS has_file, sc.score`;

const SUMMARY_FROM = `
  FROM answer_sheets s
  JOIN students st ON st.student_id = s.student_id
  LEFT JOIN scores sc ON sc.answer_sheet_id = s.answer_sheet_id`;

export async function listAnswerSheets(db: Queryable, examId: number): Promise<AnswerSheetSummary[]> {
  const { rows } = await db.query<AnswerSheetSummary>(
    `SELECT ${SUMMARY_COLUMNS} ${SUMMARY_FROM} WHERE s.exam_id = $1 ORDER BY s.student_id`,
    [examId],
  );
  return rows;
}

/** Includes the exam's owner so callers can check access. */
export async function findAnswerSheet(
  db: Queryable,
  sheetId: number,
): Promise<(AnswerSheetSummary & { exam_name: string; lecturer_id: number }) | undefined> {
  const { rows } = await db.query<AnswerSheetSummary & { exam_name: string; lecturer_id: number }>(
    `SELECT ${SUMMARY_COLUMNS}, e.exam_name, e.lecturer_id
     ${SUMMARY_FROM}
     JOIN exams e ON e.exam_id = s.exam_id
     WHERE s.answer_sheet_id = $1`,
    [sheetId],
  );
  return rows[0];
}

/** Every question of the sheet's exam, with the student's answer where there is one. */
export async function listSheetAnswers(db: Queryable, sheetId: number, examId: number): Promise<SheetAnswer[]> {
  const { rows } = await db.query<SheetAnswer>(
    `SELECT q.question_id, q.question_number, q.question_type, q.question_text,
            a.answer_id, a.student_answer_text
       FROM questions q
       LEFT JOIN answers a ON a.question_id = q.question_id AND a.answer_sheet_id = $1
      WHERE q.exam_id = $2
      ORDER BY q.question_number`,
    [sheetId, examId],
  );
  return rows;
}

export async function insertAnswerSheet(db: Queryable, examId: number, studentId: string): Promise<number> {
  const { rows } = await db.query<{ answer_sheet_id: number }>(
    "INSERT INTO answer_sheets (exam_id, student_id) VALUES ($1, $2) RETURNING answer_sheet_id",
    [examId, studentId],
  );
  return rows[0]!.answer_sheet_id;
}

export async function updateVerificationStatus(
  db: Queryable,
  sheetId: number,
  status: VerificationStatus,
): Promise<void> {
  await db.query("UPDATE answer_sheets SET verification_status = $2 WHERE answer_sheet_id = $1", [sheetId, status]);
}

export async function deleteAnswerSheet(db: Queryable, sheetId: number): Promise<void> {
  await db.query("DELETE FROM answer_sheets WHERE answer_sheet_id = $1", [sheetId]);
}
