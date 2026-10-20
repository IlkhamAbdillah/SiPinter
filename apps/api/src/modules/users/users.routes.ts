import { Router } from "express";
import type { Database } from "../../config/database.js";
import { requireAuth, requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { listUsers } from "./users.repository.js";
import { createUserSchema, type CreateUserInput } from "./users.schema.js";
import { createUser } from "./users.service.js";

// Accounts are created by admins; there is no public self-registration.
export function usersRoutes(db: Database, sessionCookie: string): Router {
  const router = Router();
  router.use(requireAuth(db, sessionCookie), requireRole("admin"));

  router.get("/", async (_req, res) => {
    res.json({ data: await listUsers(db) });
  });

  router.post("/", validate({ body: createUserSchema }), async (_req, res) => {
    const user = await createUser(db, res.locals.validated!.body as CreateUserInput);
    res.status(201).json({ data: user });
  });

  return router;
}
