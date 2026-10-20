import type { Queryable } from "../../config/database.js";
import type { PublicUser, Role } from "./users.types.js";

const PUBLIC_COLUMNS = "lecturer_id, name, email, role";

export async function findUserWithPasswordByEmail(db: Queryable, email: string) {
  const { rows } = await db.query<PublicUser & { password: string }>(
    `SELECT ${PUBLIC_COLUMNS}, password FROM users WHERE email = $1`,
    [email],
  );
  return rows[0];
}

export async function listUsers(db: Queryable): Promise<PublicUser[]> {
  const { rows } = await db.query<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY lecturer_id`);
  return rows;
}

export async function insertUser(
  db: Queryable,
  user: { name: string; email: string; role: Role; passwordHash: string },
): Promise<PublicUser> {
  const { rows } = await db.query<PublicUser>(
    `INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
    [user.name, user.email, user.role, user.passwordHash],
  );
  return rows[0]!;
}
