import { type Database, withTransaction } from "../../config/database.js";
import { HttpError } from "../../lib/http-error.js";
import { isUniqueViolation } from "../../lib/pg-errors.js";
import {
  deleteAnswerKey,
  findQuestion,
  insertQuestion,
  updateQuestion,
  upsertAnswerKey,
} from "./questions.repository.js";
import type { CreateQuestionInput, UpdateQuestionInput } from "./questions.schema.js";
import type { Question } from "./questions.types.js";

export const questionNotFound = () => new HttpError(404, "QUESTION_NOT_FOUND", "Question not found");

// A question and its answer key are saved together or not at all.
export async function createQuestion(db: Database, examId: number, input: CreateQuestionInput): Promise<Question> {
  const { answer_key, ...question } = input;
  return withQuestionNumberCheck(() =>
    withTransaction(db, async (client) => {
      const questionId = await insertQuestion(client, examId, question);
      if (answer_key) await upsertAnswerKey(client, questionId, answer_key);
      return (await findQuestion(client, examId, questionId))!;
    }),
  );
}

export async function editQuestion(
  db: Database,
  examId: number,
  questionId: number,
  input: UpdateQuestionInput,
): Promise<Question> {
  const { answer_key, ...question } = input;
  return withQuestionNumberCheck(() =>
    withTransaction(db, async (client) => {
      if (!(await updateQuestion(client, examId, questionId, question))) throw questionNotFound();
      if (answer_key === null) await deleteAnswerKey(client, questionId);
      else if (answer_key) await upsertAnswerKey(client, questionId, answer_key);
      return (await findQuestion(client, examId, questionId))!;
    }),
  );
}

async function withQuestionNumberCheck<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (isUniqueViolation(error, "unique_question_number")) {
      throw new HttpError(409, "QUESTION_NUMBER_TAKEN", "This exam already has a question with that number");
    }
    throw error;
  }
}
