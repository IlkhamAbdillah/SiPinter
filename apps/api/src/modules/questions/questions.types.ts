/** One grader per type in the AI grading pipeline. Matches the CHECK constraint in migration 0003. */
export const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type AnswerKey = {
  correct_answer: string;
  /** Comma-separated keywords used when grading short answers and essays. */
  keywords: string | null;
};

export type Question = {
  question_id: number;
  exam_id: number;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  answer_key: AnswerKey | null;
};
