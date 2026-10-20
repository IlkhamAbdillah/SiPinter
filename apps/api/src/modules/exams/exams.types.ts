export type Exam = {
  exam_id: number;
  lecturer_id: number;
  exam_name: string;
  /** `YYYY-MM-DD`. Read as text so the date never shifts with the server's time zone. */
  exam_date: string;
};

export type ExamSummary = Exam & {
  lecturer_name: string;
  question_count: number;
  answer_sheet_count: number;
  /** Answer sheets that already have a score. */
  graded_count: number;
};
