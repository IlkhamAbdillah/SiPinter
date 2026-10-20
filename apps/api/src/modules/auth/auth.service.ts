import { createHash, randomBytes } from "node:crypto";
import type { Queryable } from "../../config/database.js";
import { findUserWithPasswordByEmail } from "../users/users.repository.js";
import type { PublicUser } from "../users/users.types.js";
import { deleteExpiredSessions, deleteSession, findUserBySession, insertSession } from "./auth.repository.js";
import { verifyAgainstDummy, verifyPassword } from "./password.js";

/** Only the hash of a session token is stored; the raw token lives in the browser cookie. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type LoginResult = { user: PublicUser; token: string; expiresAt: Date };

/** Returns null for an unknown email or a wrong password, without revealing which. */
export async function login(
  db: Queryable,
  email: string,
  password: string,
  sessionTtlMs: number,
): Promise<LoginResult | null> {
  const record = await findUserWithPasswordByEmail(db, email);
  if (!record) return verifyAgainstDummy(password).then(() => null);
  if (!(await verifyPassword(password, record.password))) return null;

  const { password: _password, ...user } = record;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionTtlMs);

  await deleteExpiredSessions(db, user.lecturer_id);
  await insertSession(db, hashToken(token), user.lecturer_id, expiresAt);
  return { user, token, expiresAt };
}

export function getSessionUser(db: Queryable, token: string): Promise<PublicUser | undefined> {
  return findUserBySession(db, hashToken(token));
}

export function logout(db: Queryable, token: string): Promise<void> {
  return deleteSession(db, hashToken(token));
}
