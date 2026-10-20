// PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html

type PgError = { code?: unknown; constraint?: unknown };

function pgError(error: unknown): PgError | undefined {
  return typeof error === "object" && error !== null ? (error as PgError) : undefined;
}

/** `constraint` narrows the check to one named constraint, e.g. `unique_student_exam`. */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  const pg = pgError(error);
  return pg?.code === "23505" && (constraint === undefined || pg.constraint === constraint);
}

export function isForeignKeyViolation(error: unknown, constraint?: string): boolean {
  const pg = pgError(error);
  return pg?.code === "23503" && (constraint === undefined || pg.constraint === constraint);
}
