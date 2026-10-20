import type { Queryable } from "../../config/database.js";
import type { AnswerKeyInput, CreateQuestionInput, UpdateQuestionInput } from "./questions.schema.js";
import type { Question } from "./questions.types.js";

const QUESTION_QUERY = `
  SELECT q.question_id, q.exam_id, q.question_number, q.question_type, q.question_text,
         CASE WHEN k.answer_key_id IS NULL THEN NULL
              ELSE json_build_object('correct_answer', k.correct_answer, 'keywords', k.keywords)
         END AS answer_key
    FROM questions q
    LEFT JOIN answer_keys k ON k.question_id = q.question_id`;

export async function listQuestions(db: Queryable, examId: number): Promise<Question[]> {
  const { rows } = await db.query<Question>(`${QUESTION_QUERY} WHERE q.exam_id = $1 ORDER BY q.question_number`, [
    examId,
  ]);
  return rows;
}

export async function findQuestion(db: Queryable, examId: number, questionId: number): Promise<Question | undefined> {
  const { rows } = await db.query<Question>(`${QUESTION_QUERY} WHERE q.exam_id = $1 AND q.question_id = $2`, [
    examId,
    questionId,
  ]);
  return rows[0];
}

export async function insertQuestion(
  db: Queryable,
  examId: number,
  input: Omit<CreateQuestionInput, "answer_key">,
): Promise<number> {
  const { rows } = await db.query<{ question_id: number }>(
    `INSERT INTO questions (exam_id, question_number, question_type, question_text)
     VALUES ($1, $2, $3, $4) RETURNING question_id`,
    [examId, input.question_number, input.question_type, input.question_text],
  );
  return rows[0]!.question_id;
}

/** Returns false when the question does not exist in this exam. */
export async function updateQuestion(
  db: Queryable,
  examId: number,
  questionId: number,
  input: Omit<UpdateQuestionInput, "answer_key">,
): Promise<boolean> {
  const { rowCount } = await db.query(
    `UPDATE questions
        SET question_number = COALESCE($3, question_number),
            question_type = COALESCE($4, question_type),
            question_text = COALESCE($5, question_text)
      WHERE exam_id = $1 AND question_id = $2`,
    [examId, questionId, input.question_number ?? null, input.question_type ?? null, input.question_text ?? null],
  );
  return rowCount === 1;
}

export async function upsertAnswerKey(db: Queryable, questionId: number, key: AnswerKeyInput): Promise<void> {
  await db.query(
    `INSERT INTO answer_keys (question_id, correct_answer, keywords) VALUES ($1, $2, $3)
     ON CONFLICT (question_id) DO UPDATE SET correct_answer = EXCLUDED.correct_answer, keywords = EXCLUDED.keywords`,
    [questionId, key.correct_answer, key.keywords],
  );
}

export async function deleteAnswerKey(db: Queryable, questionId: number): Promise<void> {
  await db.query("DELETE FROM answer_keys WHERE question_id = $1", [questionId]);
}

/** Returns false when the question does not exist in this exam. */
export async function deleteQuestion(db: Queryable, examId: number, questionId: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM questions WHERE exam_id = $1 AND question_id = $2", [
    examId,
    questionId,
  ]);
  return rowCount === 1;
}
