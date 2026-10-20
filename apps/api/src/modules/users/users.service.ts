import type { Queryable } from "../../config/database.js";
import { HttpError } from "../../lib/http-error.js";
import { isUniqueViolation } from "../../lib/pg-errors.js";
import { hashPassword } from "../auth/password.js";
import { insertUser } from "./users.repository.js";
import type { CreateUserInput } from "./users.schema.js";
import type { PublicUser } from "./users.types.js";

export async function createUser(db: Queryable, input: CreateUserInput): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await insertUser(db, { name: input.name, email: input.email, role: input.role, passwordHash });
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "EMAIL_TAKEN", "A user with this email already exists");
    throw error;
  }
}
