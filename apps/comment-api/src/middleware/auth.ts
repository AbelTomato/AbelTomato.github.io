import { createMiddleware } from "hono/factory";

import { createHttpError } from "../http/errors";
import type { AuthService } from "../services/authService";

export function createAuthMiddleware(authService: AuthService) {
  return createMiddleware(async (c, next) => {
    const authorization = c.req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token || !(await authService.verifyToken(token))) {
      throw createHttpError(401, "UNAUTHORIZED", "请先登录管理员账号");
    }

    await next();
  });
}