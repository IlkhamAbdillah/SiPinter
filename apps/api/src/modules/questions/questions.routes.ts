import { Router } from "express";
import type { Database } from "../../config/database.js";
import { validate } from "../../middlewares/validate.js";
import { getAccessibleExam } from "../exams/exams.service.js";
import { deleteQuestion, findQuestion, listQuestions } from "./questions.repository.js";
import {
  type CreateQuestionInput,
  createQuestionSchema,
  questionParamsSchema,
  questionsParamsSchema,
  type UpdateQuestionInput,
  updateQuestionSchema,
} from "./questions.schema.js";
import { createQuestion, editQuestion, questionNotFound } from "./questions.service.js";

type QuestionParams = { examId: number; questionId: number };

/** Mounted at `/api/exams/:examId/questions`, behind `requireAuth`. */
export function questionsRoutes(db: Database): Router {
  const router = Router({ mergeParams: true });

  router.get("/", validate({ params: questionsParamsSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    res.json({ data: await listQuestions(db, examId) });
  });

  router.post("/", validate({ params: questionsParamsSchema, body: createQuestionSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    const question = await createQuestion(db, examId, res.locals.validated!.body as CreateQuestionInput);
    res.status(201).json({ data: question });
  });

  router.get("/:questionId", validate({ params: questionParamsSchema }), async (_req, res) => {
    const { examId, questionId } = res.locals.validated!.params as QuestionParams;
    await getAccessibleExam(db, examId, res.locals.user!);
    const question = await findQuestion(db, examId, questionId);
    if (!question) throw questionNotFound();
    res.json({ data: question });
  });

  router.patch(
    "/:questionId",
    validate({ params: questionParamsSchema, body: updateQuestionSchema }),
    async (_req, res) => {
      const { examId, questionId } = res.locals.validated!.params as QuestionParams;
      await getAccessibleExam(db, examId, res.locals.user!);
      const question = await editQuestion(db, examId, questionId, res.locals.validated!.body as UpdateQuestionInput);
      res.json({ data: question });
    },
  );

  // Also deletes the question's answer key and the students' answers to it (ON DELETE CASCADE).
  router.delete("/:questionId", validate({ params: questionParamsSchema }), async (_req, res) => {
    const { examId, questionId } = res.locals.validated!.params as QuestionParams;
    await getAccessibleExam(db, examId, res.locals.user!);
    if (!(await deleteQuestion(db, examId, questionId))) throw questionNotFound();
    res.status(204).end();
  });

  return router;
}
