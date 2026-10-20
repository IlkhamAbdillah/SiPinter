import type { PublicUser } from "../modules/users/users.types.js";

declare global {
  namespace Express {
    interface Locals {
      /** Set by `requireAuth` for authenticated requests. */
      user?: PublicUser;
      /** Set by `validate` with the parsed request input. */
      validated?: Record<string, unknown>;
    }
  }
}

export {};
