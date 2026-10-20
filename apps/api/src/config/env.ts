import { z } from "zod";

const databaseUrl = z
  .url({ protocol: /^postgres(ql)?$/ })
  // pg lets `sslmode` in the URL override the `ssl` object built from DATABASE_SSL,
  // which would silently weaken certificate checks. Keep TLS settings in one place.
  .refine((value) => !new URL(value).searchParams.has("sslmode"), {
    message: "Remove sslmode from DATABASE_URL; use DATABASE_SSL instead",
  });

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: databaseUrl,
    // disable: plain TCP (local Docker only)
    // require: TLS without certificate verification
    // verify-full: TLS + verify the server certificate against DATABASE_SSL_CA_PATH (use for AWS RDS)
    DATABASE_SSL: z.enum(["disable", "require", "verify-full"]).default("disable"),
    DATABASE_SSL_CA_PATH: z.string().min(1).optional(),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
    // Public origin of the web app (what the browser shows in the address bar).
    // State-changing requests from any other origin are rejected (CSRF defence).
    APP_ORIGIN: z.url().optional(),
    // Absolute session lifetime; users must log in again afterwards.
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(12),
    // Comma-separated browser origins allowed to call the API directly.
    // Leave empty when the browser reaches the API through the same origin (Next.js rewrite or Nginx).
    CORS_ORIGINS: z
      .string()
      .default("")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.url())),
  })
  .superRefine((env, ctx) => {
    if (env.DATABASE_SSL === "verify-full" && !env.DATABASE_SSL_CA_PATH) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_SSL_CA_PATH"],
        message: "Required when DATABASE_SSL=verify-full",
      });
    }
    if (env.NODE_ENV === "production" && !env.APP_ORIGIN) {
      ctx.addIssue({ code: "custom", path: ["APP_ORIGIN"], message: "Required in production" });
    }
    if (env.NODE_ENV === "production" && env.DATABASE_SSL === "disable") {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_SSL"],
        message: "TLS must be enabled in production",
      });
    }
  })
  .transform((env) => ({ ...env, APP_ORIGIN: env.APP_ORIGIN ?? "http://localhost:3000" }));

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    // Only report variable names and rule messages, never the values themselves.
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}
