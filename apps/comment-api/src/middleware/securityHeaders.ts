import { createMiddleware } from "hono/factory";

export const securityHeadersMiddleware = createMiddleware(async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  await next();
});