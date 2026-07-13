import { Hono } from "hono";

import { createHttpError } from "../http/errors";
import { createAuthMiddleware } from "../middleware/auth";
import type { AuthService } from "../services/authService";
import type { CommentService } from "../services/commentService";
import {
  adminCommentsQuerySchema,
  adminLoginBodySchema,
  updateCommentStatusBodySchema,
} from "../validation/adminSchemas";

interface CreateAdminRouteOptions {
  authService: AuthService;
  commentService: CommentService;
}

export function createAdminRoute({
  authService,
  commentService,
}: CreateAdminRouteOptions) {
  const route = new Hono();

  route.post("/login", async (c) => {
    const json = await readJson(c.req.raw);
    const body = adminLoginBodySchema.safeParse(json);

    if (!body.success) {
      throw createHttpError(400, "BAD_REQUEST", "登录参数无效");
    }

    const token = await authService.login(body.data.password);

    if (!token) {
      throw createHttpError(401, "UNAUTHORIZED", "管理员密码错误");
    }

    return c.json({ token });
  });

  route.use("/*", createAuthMiddleware(authService));

  route.get("/comments", async (c) => {
    const query = adminCommentsQuerySchema.safeParse({
      status: c.req.query("status") ?? "pending",
    });

    if (!query.success) {
      throw createHttpError(400, "BAD_REQUEST", "评论状态参数无效");
    }

    const comments = await commentService.listByStatus(query.data.status);
    return c.json({ comments });
  });

  route.patch("/comments/:id/status", async (c) => {
    const id = c.req.param("id");
    const json = await readJson(c.req.raw);
    const body = updateCommentStatusBodySchema.safeParse(json);

    if (!body.success) {
      throw createHttpError(400, "BAD_REQUEST", "评论状态无效");
    }

    const updated = await commentService.updateStatus(id, body.data.status);

    if (!updated) {
      throw createHttpError(404, "NOT_FOUND", "评论不存在");
    }

    return c.json({ status: body.data.status });
  });

  route.delete("/comments/:id", async (c) => {
    const updated = await commentService.updateStatus(c.req.param("id"), "deleted");

    if (!updated) {
      throw createHttpError(404, "NOT_FOUND", "评论不存在");
    }

    return c.json({ status: "deleted" });
  });

  return route;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw createHttpError(400, "BAD_REQUEST", "请求体必须是合法 JSON");
  }
}