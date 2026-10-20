import { Router } from "express";
import type { Database } from "../../config/database.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { examAnswerSheetsRoutes } from "../answer-sheets/answer-sheets.routes.js";
import { questionsRoutes } from "../questions/questions.routes.js";
import { deleteExam, findExamSummary, insertExam, listExams, updateExam } from "./exams.repository.js";
import {
  type CreateExamInput,
  createExamSchema,
  examParamsSchema,
  type UpdateExamInput,
  updateExamSchema,
} from "./exams.schema.js";
import { getAccessibleExam } from "./exams.service.js";

export function examsRoutes(db: Database, sessionCookie: string): Router {
  const router = Router();
  router.use(requireAuth(db, sessionCookie));

  router.get("/", async (_req, res) => {
    const user = res.locals.user!;
    res.json({ data: await listExams(db, user.role === "admin" ? null : user.lecturer_id) });
  });

  // The creator owns the exam.
  router.post("/", validate({ body: createExamSchema }), async (_req, res) => {
    const examId = await insertExam(db, res.locals.user!.lecturer_id, res.locals.validated!.body as CreateExamInput);
    res.status(201).json({ data: await findExamSummary(db, examId) });
  });

  router.get("/:examId", validate({ params: examParamsSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    res.json({ data: await findExamSummary(db, examId) });
  });

  router.patch("/:examId", validate({ params: examParamsSchema, body: updateExamSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    await updateExam(db, examId, res.locals.validated!.body as UpdateExamInput);
    res.json({ data: await findExamSummary(db, examId) });
  });

  // Also deletes the exam's questions, answer keys, answer sheets, answers and scores (ON DELETE CASCADE).
  router.delete("/:examId", validate({ params: examParamsSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    await deleteExam(db, examId);
    res.status(204).end();
  });

  router.use("/:examId/questions", questionsRoutes(db));
  router.use("/:examId/answer-sheets", examAnswerSheetsRoutes(db));

  return router;
}
