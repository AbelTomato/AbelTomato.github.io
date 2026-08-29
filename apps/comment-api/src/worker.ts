import { createApp } from "./app";
import { loadConfig, type ConfigEnv } from "./config";
import { createDb } from "./db/client";
import { createDrizzleCommentRepository } from "./repositories/commentRepository";
import { createAuthService } from "./services/authService";
import { createCommentService } from "./services/commentService";
import { createTurnstileService } from "./services/turnstileService";

interface WorkerEnv {
  PORT?: string;
  NODE_ENV?: string;
  DATABASE_URL?: string;
  HYPERDRIVE_CONNECTION_STRING?: string;
  COMMENT_ADMIN_PASSWORD_HASH?: string;
  COMMENT_JWT_SECRET?: string;
  COMMENT_ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
  COMMENT_HASH_SALT?: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
}

function getApp(env: WorkerEnv) {
  const config = loadConfig({
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    DATABASE_URL: env.DATABASE_URL,
    HYPERDRIVE_CONNECTION_STRING:
      env.HYPERDRIVE_CONNECTION_STRING ?? env.HYPERDRIVE?.connectionString,
    COMMENT_ADMIN_PASSWORD_HASH: env.COMMENT_ADMIN_PASSWORD_HASH,
    COMMENT_JWT_SECRET: env.COMMENT_JWT_SECRET,
    COMMENT_ALLOWED_ORIGINS: env.COMMENT_ALLOWED_ORIGINS,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
    COMMENT_HASH_SALT: env.COMMENT_HASH_SALT,
  });

  const databaseConnectionString =
    config.hyperdriveConnectionString ?? config.databaseUrl;
  const commentService = databaseConnectionString
    ? createCommentService(
        createDrizzleCommentRepository(
          createDb({
            databaseUrl: config.databaseUrl,
            hyperdriveConnectionString: config.hyperdriveConnectionString,
          }),
        ),
        {
          hashSalt: config.hashSalt,
        },
      )
    : undefined;
  const turnstileService = config.turnstileSecretKey
    ? createTurnstileService(config.turnstileSecretKey)
    : undefined;
  const authService =
    config.adminPasswordHash && config.jwtSecret
      ? createAuthService({
          adminPasswordHash: config.adminPasswordHash,
          jwtSecret: config.jwtSecret,
        })
      : undefined;

  return createApp({
    allowedOrigins: config.allowedOrigins,
    authService,
    commentService,
    turnstileService,
  });
}

export default {
  fetch(request: Request, env: WorkerEnv) {
    return getApp(env).fetch(request);
  },
};