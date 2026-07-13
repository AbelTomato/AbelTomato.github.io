import { createMiddleware } from "hono/factory";

import { createHttpError } from "../http/errors";

interface CorsOptions {
  allowedOrigins: string[];
}

const writeMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export function createCorsMiddleware({ allowedOrigins }: CorsOptions) {
  const allowed = new Set(allowedOrigins);

  return createMiddleware(async (c, next) => {
    const origin = c.req.header("origin");

    c.header("Vary", "Origin");

    if (origin && allowed.has(origin)) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Headers", "content-type, authorization");
      c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    }

    if (c.req.method === "OPTIONS") {
      return c.body(null, origin && allowed.has(origin) ? 204 : 403);
    }

    if (origin && writeMethods.has(c.req.method) && !allowed.has(origin)) {
      throw createHttpError(403, "FORBIDDEN", "当前来源不允许提交评论");
    }

    await next();
  });
}