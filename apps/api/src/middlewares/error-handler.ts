import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

/**
 * Every error response has the same shape:
 *   { "error": { "code": "NOT_FOUND", "message": "...", "details"?: ... } }
 * Successful responses use { "data": ... }.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, ...(error.details !== undefined && { details: error.details }) },
    });
    return;
  }

  // Malformed JSON bodies and oversized payloads come from body-parser with a 4xx status.
  if (isClientError(error)) {
    res.status(error.status).json({ error: { code: "BAD_REQUEST", message: "Malformed request body" } });
    return;
  }

  // Anything else is unexpected: log it server-side, but never leak SQL, stack traces or secrets.
  console.error("[api] unhandled error:", error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
};

function isClientError(error: unknown): error is { status: number } {
  if (typeof error !== "object" || error === null || !("status" in error)) return false;
  const { status } = error as { status: unknown };
  return typeof status === "number" && status >= 400 && status < 500;
}
