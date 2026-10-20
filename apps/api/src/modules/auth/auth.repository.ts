import type { Queryable } from "../../config/database.js";
import type { PublicUser } from "../users/users.types.js";

export async function insertSession(db: Queryable, tokenHash: string, lecturerId: number, expiresAt: Date) {
  await db.query("INSERT INTO sessions (token_hash, lecturer_id, expires_at) VALUES ($1, $2, $3)", [
    tokenHash,
    lecturerId,
    expiresAt,
  ]);
}

export async function findUserBySession(db: Queryable, tokenHash: string): Promise<PublicUser | undefined> {
  const { rows } = await db.query<PublicUser>(
    `SELECT u.lecturer_id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.lecturer_id = s.lecturer_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash],
  );
  return rows[0];
}

export async function deleteSession(db: Queryable, tokenHash: string) {
  await db.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}

export async function deleteExpiredSessions(db: Queryable, lecturerId: number) {
  await db.query("DELETE FROM sessions WHERE lecturer_id = $1 AND expires_at <= now()", [lecturerId]);
}
