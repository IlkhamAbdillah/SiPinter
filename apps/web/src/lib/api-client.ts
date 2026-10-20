/**
 * The single place the frontend talks to the Express API.
 *
 * Browser: requests go to the same origin (`/api/...`), which Next.js (dev) or Nginx (production)
 * forwards to Express. Keeping one origin means cookies stay first-party and no CORS is needed.
 * Server (Server Components, route handlers): requests go straight to API_INTERNAL_URL.
 *
 * The API responds with `{ data }` on success and `{ error: { code, message, details? } }` on failure.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

function baseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_INTERNAL_URL ?? "http://localhost:4000";
}

export async function apiRequest<T>(path: string, { body, headers, ...init }: ApiRequestOptions = {}): Promise<T> {
  if (!path.startsWith("/api/")) throw new Error(`API paths must start with /api/: ${path}`);

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? "Terjadi kesalahan pada server.",
      error?.details,
    );
  }

  return (payload as { data: T } | null)?.data as T;
}

export const apiClient = {
  get: <T>(path: string, init?: ApiRequestOptions) => apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: ApiRequestOptions) => apiRequest<T>(path, { ...init, method: "DELETE" }),
};
