import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../lib/http-error.js";

type RequestSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

/**
 * Validates request input with Zod before it reaches a controller.
 * Parsed values are stored on `res.locals.validated` so coercions and defaults are kept.
 */
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    const validated: Record<string, unknown> = {};
    const issues: { location: string; path: string; message: string }[] = [];

    for (const location of ["params", "query", "body"] as const) {
      const schema = schemas[location];
      if (!schema) continue;
      const result = schema.safeParse(req[location]);
      if (result.success) {
        validated[location] = result.data;
      } else {
        for (const issue of result.error.issues) {
          issues.push({ location, path: issue.path.join("."), message: issue.message });
        }
      }
    }

    if (issues.length > 0) {
      next(new HttpError(400, "VALIDATION_ERROR", "Request validation failed", issues));
      return;
    }

    res.locals.validated = validated;
    next();
  };
}
