import type { QuestionType } from "../questions/questions.types.js";

/** `pending` until the lecturer has reviewed the grading result. Matches the CHECK constraint in migration 0003. */
export const VERIFICATION_STATUSES = ["pending", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export type AnswerSheetSummary = {
  answer_sheet_id: number;
  exam_id: number;
  student_id: string;
  student_name: string;
  verification_status: VerificationStatus;
  /** Whether a scanned PDF has been uploaded. The storage path itself stays on the server. */
  has_file: boolean;
  /** 0–100, or null until the sheet has been graded. */
  score: number | null;
};

export type SheetAnswer = {
  question_id: number;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  /** Null when the sheet has no answer for this question yet. */
  answer_id: number | null;
  student_answer_text: string | null;
};

export type AnswerSheetDetail = AnswerSheetSummary & {
  exam_name: string;
  answers: SheetAnswer[];
};
