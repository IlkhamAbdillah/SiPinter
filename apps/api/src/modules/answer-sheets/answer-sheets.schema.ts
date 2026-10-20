import { z } from "zod";
import { idParamSchema } from "../../lib/schemas.js";
import { VERIFICATION_STATUSES } from "./answer-sheets.types.js";

export const examSheetsParamsSchema = z.object({ examId: idParamSchema });
export const sheetParamsSchema = z.object({ sheetId: idParamSchema });

export const createAnswerSheetSchema = z.object({
  // The student's NIM (students.student_id).
  student_id: z.string().trim().min(1).max(30),
});

export const updateAnswerSheetSchema = z.object({
  verification_status: z.enum(VERIFICATION_STATUSES),
});

export type CreateAnswerSheetInput = z.infer<typeof createAnswerSheetSchema>;
export type UpdateAnswerSheetInput = z.infer<typeof updateAnswerSheetSchema>;
