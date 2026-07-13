import { Hono } from "hono";

import { createHttpError, errorToResponse } from "./http/errors";
import { createCorsMiddleware } from "./middleware/cors";
import { createRateLimitMiddleware } from "./middleware/rateLimit";
import { securityHeadersMiddleware } from "./middleware/securityHeaders";
import { createAdminRoute } from "./routes/admin";
import { createCommentsRoute } from "./routes/comments";
import type { AuthService } from "./services/authService";
import {
  createUnavailableCommentService,
  type CommentService,
} from "./services/commentService";
import type { TurnstileService } from "./services/turnstileService";

interface CreateAppOptions {
  allowedOrigins?: string[];
  authService?: AuthService;
  commentService?: CommentService;
  turnstileService?: TurnstileService;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = new Hono();
  const commentService =
    options.commentService ?? createUnavailableCommentService();

  app.use("*", securityHeadersMiddleware);
  app.use(
    "*",
    createCorsMiddleware({
      allowedOrigins: options.allowedOrigins ?? ["http://localhost:4321"],
    }),
  );
  app.use(
    "/api/comments/*",
    createRateLimitMiddleware({ windowMs: 60_000, maxRequests: 5 }),
  );

  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  app.route(
    "/api/comments",
    createCommentsRoute({
      commentService,
      turnstileService: options.turnstileService,
    }),
  );

  if (options.authService) {
    app.route(
      "/api/admin",
      createAdminRoute({
        authService: options.authService,
        commentService,
      }),
    );
  }

  app.notFound(() => {
    throw createHttpError(404, "NOT_FOUND", "请求的资源不存在");
  });

  app.onError((error, c) => {
    const { status, body } = errorToResponse(error);
    return c.json(body, status);
  });

  return app;
}

export type CommentApiApp = ReturnType<typeof createApp>;