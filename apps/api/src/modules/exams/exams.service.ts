import type { Queryable } from "../../config/database.js";
import { HttpError } from "../../lib/http-error.js";
import type { PublicUser } from "../users/users.types.js";
import { findExam } from "./exams.repository.js";
import type { Exam } from "./exams.types.js";

/** Lecturers work with their own exams only; admins can work with every exam. */
export function canAccessExam(user: PublicUser, exam: Pick<Exam, "lecturer_id">): boolean {
  return user.role === "admin" || exam.lecturer_id === user.lecturer_id;
}

/**
 * Loads an exam the user may access. Someone else's exam gets the same 404 as a missing one,
 * so ids cannot be probed to learn which exams exist.
 */
export async function getAccessibleExam(db: Queryable, examId: number, user: PublicUser): Promise<Exam> {
  const exam = await findExam(db, examId);
  if (!exam || !canAccessExam(user, exam)) throw new HttpError(404, "EXAM_NOT_FOUND", "Exam not found");
  return exam;
}
