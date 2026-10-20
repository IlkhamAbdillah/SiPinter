import { z } from "zod";
import { emailSchema } from "../users/users.schema.js";

export const loginSchema = z.object({
  email: emailSchema,
  // No strength rules at login: just bound the size so hashing cost stays predictable.
  password: z.string().min(1).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
