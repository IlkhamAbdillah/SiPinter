import { z } from "zod";
import { idParamSchema, MAX_INT } from "../../lib/schemas.js";
import { QUESTION_TYPES } from "./questions.types.js";

export const questionsParamsSchema = z.object({ examId: idParamSchema });
export const questionParamsSchema = z.object({ examId: idParamSchema, questionId: idParamSchema });

const answerKeySchema = z.object({
  correct_answer: z.string().trim().min(1).max(255),
  // An empty string means "no keywords".
  keywords: z
    .string()
    .trim()
    .max(255)
    .nullish()
    .transform((keywords) => keywords || null),
});

export const createQuestionSchema = z.object({
  question_number: z.number().int().positive().max(MAX_INT),
  question_type: z.enum(QUESTION_TYPES),
  question_text: z.string().trim().min(1).max(10_000),
  answer_key: answerKeySchema.optional(),
});

/** Omitted fields stay unchanged. `answer_key: null` removes the key; an object replaces it. */
export const updateQuestionSchema = z
  .object({
    question_number: createQuestionSchema.shape.question_number.optional(),
    question_type: createQuestionSchema.shape.question_type.optional(),
    question_text: createQuestionSchema.shape.question_text.optional(),
    answer_key: answerKeySchema.nullable().optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), "Provide at least one field");

export type AnswerKeyInput = z.infer<typeof answerKeySchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
