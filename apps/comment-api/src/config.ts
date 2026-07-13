import { z } from "zod";

const configSchema = z
  .object({
    port: z.coerce.number().int().min(1).max(65535).default(8787),
    nodeEnv: z.string().default("development"),
    databaseUrl: z.string().url().optional(),
    adminPasswordHash: z.string().length(64).optional(),
    jwtSecret: z.string().min(32).optional(),
    allowedOrigins: z
      .string()
      .default("http://localhost:4321")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    turnstileSecretKey: z.string().min(1).optional(),
    hashSalt: z.string().min(16).optional(),
  })
  .superRefine((config, context) => {
    if (config.databaseUrl && !config.hashSalt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hashSalt"],
        message: "COMMENT_HASH_SALT is required when DATABASE_URL is configured",
      });
    }
  });

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse({
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    adminPasswordHash: env.COMMENT_ADMIN_PASSWORD_HASH,
    jwtSecret: env.COMMENT_JWT_SECRET,
    allowedOrigins: env.COMMENT_ALLOWED_ORIGINS,
    turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
    hashSalt: env.COMMENT_HASH_SALT,
  });
}