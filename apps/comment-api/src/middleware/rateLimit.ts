import { createMiddleware } from "hono/factory";

import { createHttpError } from "../http/errors";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimitMiddleware({
  windowMs,
  maxRequests,
}: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return createMiddleware(async (c, next) => {
    if (c.req.method !== "POST") {
      await next();
      return;
    }

    const now = Date.now();
    const key = `${getClientIp(c.req.raw)}:${c.req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > maxRequests) {
      throw createHttpError(429, "RATE_LIMITED", "请求过于频繁，请稍后再试");
    }

    await next();
  });
}

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}