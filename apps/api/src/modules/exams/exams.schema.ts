import { z } from "zod";
import { idParamSchema } from "../../lib/schemas.js";

export const examParamsSchema = z.object({ examId: idParamSchema });

export const createExamSchema = z.object({
  exam_name: z.string().trim().min(1).max(255),
  exam_date: z.iso.date(),
});

export const updateExamSchema = createExamSchema
  .partial()
  .refine((input) => input.exam_name !== undefined || input.exam_date !== undefined, "Provide at least one field");

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
