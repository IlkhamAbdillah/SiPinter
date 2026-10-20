import { Router } from "express";
import type { Database } from "../../config/database.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { getAccessibleExam } from "../exams/exams.service.js";
import { deleteAnswerSheet, listAnswerSheets } from "./answer-sheets.repository.js";
import {
  type CreateAnswerSheetInput,
  createAnswerSheetSchema,
  examSheetsParamsSchema,
  sheetParamsSchema,
  type UpdateAnswerSheetInput,
  updateAnswerSheetSchema,
} from "./answer-sheets.schema.js";
import {
  createAnswerSheet,
  getAccessibleAnswerSheet,
  getAnswerSheetDetail,
  setVerificationStatus,
} from "./answer-sheets.service.js";

/**
 * Mounted at `/api/exams/:examId/answer-sheets`, behind `requireAuth`.
 * The list doubles as the exam's results: each sheet carries its score.
 */
export function examAnswerSheetsRoutes(db: Database): Router {
  const router = Router({ mergeParams: true });

  router.get("/", validate({ params: examSheetsParamsSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    res.json({ data: await listAnswerSheets(db, examId) });
  });

  // Registers a student's sheet for the exam. The scanned PDF is uploaded separately (S3, not yet implemented).
  router.post("/", validate({ params: examSheetsParamsSchema, body: createAnswerSheetSchema }), async (_req, res) => {
    const { examId } = res.locals.validated!.params as { examId: number };
    await getAccessibleExam(db, examId, res.locals.user!);
    const { student_id } = res.locals.validated!.body as CreateAnswerSheetInput;
    res.status(201).json({ data: await createAnswerSheet(db, examId, student_id) });
  });

  return router;
}

/** Mounted at `/api/answer-sheets`. */
export function answerSheetsRoutes(db: Database, sessionCookie: string): Router {
  const router = Router();
  router.use(requireAuth(db, sessionCookie));

  // The sheet with every question of its exam, the student's answers and the score.
  router.get("/:sheetId", validate({ params: sheetParamsSchema }), async (_req, res) => {
    const { sheetId } = res.locals.validated!.params as { sheetId: number };
    res.json({ data: await getAnswerSheetDetail(db, sheetId, res.locals.user!) });
  });

  router.patch(
    "/:sheetId",
    validate({ params: sheetParamsSchema, body: updateAnswerSheetSchema }),
    async (_req, res) => {
      const { sheetId } = res.locals.validated!.params as { sheetId: number };
      const { verification_status } = res.locals.validated!.body as UpdateAnswerSheetInput;
      res.json({ data: await setVerificationStatus(db, sheetId, verification_status, res.locals.user!) });
    },
  );

  // Also deletes the sheet's answers and score (ON DELETE CASCADE).
  router.delete("/:sheetId", validate({ params: sheetParamsSchema }), async (_req, res) => {
    const { sheetId } = res.locals.validated!.params as { sheetId: number };
    await getAccessibleAnswerSheet(db, sheetId, res.locals.user!);
    await deleteAnswerSheet(db, sheetId);
    res.status(204).end();
  });

  return router;
}
