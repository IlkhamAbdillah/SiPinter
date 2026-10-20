import { headers } from "next/headers";
import { ApiError, apiClient } from "@/lib/api-client";
import type { CurrentUser } from "../types";

/**
 * Server-only: asks the API who owns the incoming request's session cookie.
 * Returns null when not logged in. This is for page routing and UI only;
 * the API checks the session again on every protected request.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;
  try {
    return await apiClient.get<CurrentUser>("/api/auth/me", { headers: { cookie }, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
