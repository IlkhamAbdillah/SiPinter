import type { RequestHandler } from "express";
import type { Database } from "../config/database.js";
import { readCookie } from "../lib/cookies.js";
import { HttpError } from "../lib/http-error.js";
import { getSessionUser } from "../modules/auth/auth.service.js";
import type { Role } from "../modules/users/users.types.js";

/** Rejects requests without a valid, unexpired session and sets `res.locals.user`. */
export function requireAuth(db: Database, sessionCookie: string): RequestHandler {
  return async (req, res, next) => {
    const token = readCookie(req.headers.cookie, sessionCookie);
    const user = token ? await getSessionUser(db, token) : undefined;
    if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Login required");
    res.locals.user = user;
    next();
  };
}

/** Must run after `requireAuth`. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user;
    if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Login required");
    if (!roles.includes(user.role)) throw new HttpError(403, "FORBIDDEN", "You do not have permission to do this");
    next();
  };
}
