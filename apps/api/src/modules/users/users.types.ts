export const ROLES = ["lecturer", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** A user as exposed by the API. Never includes the password hash. */
export type PublicUser = {
  lecturer_id: number;
  name: string;
  email: string;
  role: Role;
};
