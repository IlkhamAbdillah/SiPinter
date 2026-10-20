export type AnswerSheet = {
  answer_sheet_id: number;
  exam_id: number;
  student_id: string;
  file_path: string | null;
  verification_status: string;
};