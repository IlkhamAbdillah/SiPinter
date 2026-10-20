import { z } from "zod";
import { ROLES } from "./users.types.js";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(255));

// Length-only policy (NIST SP 800-63B): at least 8 characters, capped to keep hashing cost bounded.
export const newPasswordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  role: z.enum(ROLES),
  password: newPasswordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
