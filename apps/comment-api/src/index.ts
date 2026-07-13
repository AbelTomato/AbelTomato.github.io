import { serve } from "@hono/node-server";

import { createApp } from "./app";
import { loadConfig } from "./config";
import { loadLocalEnv } from "./config/loadEnv";
import { createDb } from "./db/client";
import { createDrizzleCommentRepository } from "./repositories/commentRepository";
import { createAuthService } from "./services/authService";
import { createCommentService } from "./services/commentService";
import { createTurnstileService } from "./services/turnstileService";

loadLocalEnv();

const config = loadConfig();
const commentService = config.databaseUrl
  ? createCommentService(createDrizzleCommentRepository(createDb(config)), {
      hashSalt: config.hashSalt,
    })
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
const app = createApp({
  allowedOrigins: config.allowedOrigins,
  authService,
  commentService,
  turnstileService,
});

serve({
  fetch: app.fetch,
  port: config.port,
});

console.info(`comment-api listening on http://localhost:${config.port}`);