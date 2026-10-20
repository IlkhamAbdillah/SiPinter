import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "./api-client";

function mockFetch(response: Response | Error) {
  const fn = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)));
  vi.stubGlobal("fetch", fn);
  return fn;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiClient", () => {
  it("unwraps { data } and calls API_INTERNAL_URL when running on the server", async () => {
    vi.stubEnv("API_INTERNAL_URL", "http://api:4000");
    const fetchMock = mockFetch(json({ data: { status: "ok" } }));

    await expect(apiClient.get("/api/health")).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith("http://api:4000/api/health", expect.objectContaining({ method: "GET" }));
  });

  it("sends JSON bodies", async () => {
    const fetchMock = mockFetch(json({ data: { id: 1 } }, 201));
    await apiClient.post("/api/exams", { exam_name: "Basis Data" });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.body).toBe('{"exam_name":"Basis Data"}');
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("throws ApiError with the server's error code and message", async () => {
    mockFetch(json({ error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: [] } }, 400));
    await expect(apiClient.get("/api/exams")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
    });
  });

  it("falls back to a generic error for non-JSON failures", async () => {
    mockFetch(new Response("<html>Bad Gateway</html>", { status: 502 }));
    await expect(apiClient.get("/api/exams")).rejects.toMatchObject({ status: 502, code: "UNKNOWN_ERROR" });
  });

  it("reports network failures as ApiError", async () => {
    mockFetch(new TypeError("fetch failed"));
    const error = await apiClient.get("/api/exams").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("rejects paths outside /api/", async () => {
    await expect(apiClient.get("https://evil.example.com/steal")).rejects.toThrow(/must start with \/api\//);
  });
});
