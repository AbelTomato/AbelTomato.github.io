import { Hono } from "hono";

import { createHttpError } from "../http/errors";
import type { CommentService } from "../services/commentService";
import type { TurnstileService } from "../services/turnstileService";
import {
  createCommentBodySchema,
  listCommentsQuerySchema,
} from "../validation/commentSchemas";

interface CreateCommentsRouteOptions {
  commentService: CommentService;
  turnstileService?: TurnstileService;
}

export function createCommentsRoute({
  commentService,
  turnstileService,
}: CreateCommentsRouteOptions) {
  const route = new Hono();

  route.get("/", async (c) => {
    const query = listCommentsQuerySchema.safeParse({
      postSlug: c.req.query("postSlug"),
    });

    if (!query.success) {
      throw createHttpError(400, "BAD_REQUEST", "评论查询参数无效");
    }

    const comments = await commentService.listApprovedByPostSlug(
      query.data.postSlug,
    );

    return c.json({ comments });
  });

  route.post("/", async (c) => {
    const json = await readJson(c.req.raw);
    const body = createCommentBodySchema.safeParse(json);

    if (!body.success) {
      throw createHttpError(400, "BAD_REQUEST", "评论提交内容无效");
    }

    if (turnstileService) {
      if (!body.data.turnstileToken) {
        throw createHttpError(403, "FORBIDDEN", "请先完成人机验证");
      }

      const verified = await turnstileService.verify(
        body.data.turnstileToken,
        c.req.header("cf-connecting-ip") ?? undefined,
      );

      if (!verified) {
        throw createHttpError(403, "FORBIDDEN", "人机验证失败");
      }
    }

    const result = await commentService.createPending({
      postSlug: body.data.postSlug,
      parentId: body.data.parentId,
      authorName: body.data.authorName,
      authorEmail: body.data.authorEmail,
      content: body.data.content,
      ipAddress: getClientIp(c.req.raw),
      userAgent: c.req.header("user-agent") ?? null,
    });

    return c.json(result, 202);
  });

  return route;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw createHttpError(400, "BAD_REQUEST", "请求体必须是合法 JSON");
  }
}