export type Role = "lecturer" | "admin";

export type CurrentUser = {
  lecturer_id: number;
  name: string;
  email: string;
  role: Role;
};

export const roleLabels: Record<Role, string> = {
  lecturer: "Dosen",
  admin: "Admin",
};
