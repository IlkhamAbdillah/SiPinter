import { z } from "zod";

/** Ids are PostgreSQL INTEGER columns; anything larger would make the query fail with a 500 instead of a 400. */
export const MAX_INT = 2_147_483_647;

/** A numeric id from the URL path, e.g. `/api/exams/:examId`. */
export const idParamSchema = z.coerce.number().int().positive().max(MAX_INT);
