import type { Queryable } from "../../config/database.js";
import { HttpError } from "../../lib/http-error.js";
import { isForeignKeyViolation, isUniqueViolation } from "../../lib/pg-errors.js";
import { canAccessExam } from "../exams/exams.service.js";
import type { PublicUser } from "../users/users.types.js";
import {
  findAnswerSheet,
  insertAnswerSheet,
  listSheetAnswers,
  updateVerificationStatus,
} from "./answer-sheets.repository.js";
import type { AnswerSheetDetail, AnswerSheetSummary, VerificationStatus } from "./answer-sheets.types.js";

/** Same 404 for a missing sheet and someone else's sheet, like exams. */
export async function getAccessibleAnswerSheet(db: Queryable, sheetId: number, user: PublicUser) {
  const sheet = await findAnswerSheet(db, sheetId);
  if (!sheet || !canAccessExam(user, sheet)) {
    throw new HttpError(404, "ANSWER_SHEET_NOT_FOUND", "Answer sheet not found");
  }
  return sheet;
}

export async function getAnswerSheetDetail(
  db: Queryable,
  sheetId: number,
  user: PublicUser,
): Promise<AnswerSheetDetail> {
  const { lecturer_id: _owner, ...sheet } = await getAccessibleAnswerSheet(db, sheetId, user);
  return { ...sheet, answers: await listSheetAnswers(db, sheetId, sheet.exam_id) };
}

export async function createAnswerSheet(db: Queryable, examId: number, studentId: string): Promise<AnswerSheetSummary> {
  let sheetId: number;
  try {
    sheetId = await insertAnswerSheet(db, examId, studentId);
  } catch (error) {
    if (isUniqueViolation(error, "unique_student_exam")) {
      throw new HttpError(409, "ANSWER_SHEET_EXISTS", "This student already has an answer sheet for this exam");
    }
    if (isForeignKeyViolation(error, "fk_answer_sheets_student")) {
      throw new HttpError(422, "UNKNOWN_STUDENT", "No student with this NIM");
    }
    throw error;
  }
  const { lecturer_id: _owner, exam_name: _name, ...sheet } = (await findAnswerSheet(db, sheetId))!;
  return sheet;
}

export async function setVerificationStatus(
  db: Queryable,
  sheetId: number,
  status: VerificationStatus,
  user: PublicUser,
): Promise<AnswerSheetDetail> {
  const sheet = await getAccessibleAnswerSheet(db, sheetId, user);
  // Verifying means the lecturer has reviewed a grading result, so there must be one.
  if (status === "verified" && sheet.score === null) {
    throw new HttpError(409, "ANSWER_SHEET_NOT_GRADED", "Only a graded answer sheet can be verified");
  }
  await updateVerificationStatus(db, sheetId, status);
  return getAnswerSheetDetail(db, sheetId, user);
}
