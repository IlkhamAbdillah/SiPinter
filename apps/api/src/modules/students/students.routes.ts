import { Router } from "express";
import type { Database } from "../../config/database.js";
import { requireAuth } from "../../middlewares/auth.js";

export type Student = {
  student_id: string;
  name: string;
  study_program: string | null;
  enrollment_year: number | null;
};

// Read-only: students are reference data for picking whose answer sheet is being added.
// Email is left out because lecturers do not need it here.
export function studentsRoutes(db: Database, sessionCookie: string): Router {
  const router = Router();
  router.use(requireAuth(db, sessionCookie));

  router.get("/", async (_req, res) => {
    const { rows } = await db.query<Student>(
      "SELECT student_id, name, study_program, enrollment_year FROM students ORDER BY student_id",
    );
    res.json({ data: rows });
  });

  return router;
}
