import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence for cookie-authenticated requests: browsers always send `Origin` on
 * state-changing requests, so a POST/PUT/PATCH/DELETE from a foreign site is rejected.
 * Requests without `Origin` (curl, server-to-server calls from Next.js) carry no
 * ambient browser cookies and are allowed through.
 */
export function originCheck(allowedOrigins: string[]): RequestHandler {
  const allowed = new Set(allowedOrigins.map((origin) => new URL(origin).origin));
  return (req, _res, next) => {
    const origin = req.headers.origin;
    if (SAFE_METHODS.has(req.method) || origin === undefined || allowed.has(origin)) {
      next();
      return;
    }
    next(new HttpError(403, "INVALID_ORIGIN", "Request origin is not allowed"));
  };
}
