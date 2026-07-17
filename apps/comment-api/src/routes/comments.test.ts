import { describe, expect, it, vi } from "vitest";

import { createApp } from "../app";
import type { CommentService } from "../services/commentService";

function createMockCommentService(
  overrides: Partial<CommentService> = {},
): CommentService {
  return {
    listApprovedByPostSlug: vi.fn().mockResolvedValue([]),
    listByStatus: vi.fn().mockResolvedValue([]),
    createPending: vi.fn().mockResolvedValue({
      status: "pending",
      message: "评论已提交，审核后展示",
    }),
    updateStatus: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createValidCommentPayload(overrides: Record<string, unknown> = {}) {
  return {
    postSlug: "2026/demo/index.md",
    authorName: "Abel",
    authorEmail: "name@example.com",
    content: "评论内容",
    ...overrides,
  };
}

describe("comments route", () => {
  it("lists approved comments for a post", async () => {
    const commentService = createMockCommentService({
      listApprovedByPostSlug: vi.fn().mockResolvedValue([
        {
          id: "0192f81e-8f9a-7000-9000-111111111111",
          postSlug: "2026/demo/index.md",
          parentId: null,
          authorName: "Abel",
          content: "评论内容",
          createdAt: "2026-07-09T15:00:00.000Z",
        },
      ]),
    });
    const app = createApp({ commentService });

    const response = await app.request(
      "/api/comments?postSlug=2026/demo/index.md",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      comments: [
        {
          id: "0192f81e-8f9a-7000-9000-111111111111",
          postSlug: "2026/demo/index.md",
          parentId: null,
          authorName: "Abel",
          content: "评论内容",
          createdAt: "2026-07-09T15:00:00.000Z",
        },
      ],
    });
    expect(commentService.listApprovedByPostSlug).toHaveBeenCalledWith(
      "2026/demo/index.md",
    );
  });

  it("rejects missing postSlug on list", async () => {
    const app = createApp({ commentService: createMockCommentService() });
    const response = await app.request("/api/comments");

    expect(response.status).toBe(400);
  });

  it("lists comments for the isolated guestbook resource", async () => {
    const commentService = createMockCommentService();
    const app = createApp({ commentService });

    const response = await app.request(
      "/api/comments?postSlug=__guestbook__",
    );

    expect(response.status).toBe(200);
    expect(commentService.listApprovedByPostSlug).toHaveBeenCalledWith(
      "__guestbook__",
    );
  });

  it("creates a pending comment", async () => {
    const commentService = createMockCommentService();
    const app = createApp({ commentService });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createValidCommentPayload()),
    });

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      status: "pending",
      message: "评论已提交，审核后展示",
    });
    expect(commentService.createPending).toHaveBeenCalledWith({
      postSlug: "2026/demo/index.md",
      parentId: null,
      authorName: "Abel",
      authorEmail: "name@example.com",
      content: "评论内容",
      ipAddress: null,
      userAgent: null,
    });
  });

  it("creates a pending guestbook message in its own resource", async () => {
    const commentService = createMockCommentService();
    const app = createApp({ commentService });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createValidCommentPayload({ postSlug: "__guestbook__" })),
    });

    expect(response.status).toBe(202);
    expect(commentService.createPending).toHaveBeenCalledWith(
      expect.objectContaining({ postSlug: "__guestbook__" }),
    );
  });

  it("passes client metadata when creating comments", async () => {
    const commentService = createMockCommentService();
    const app = createApp({ commentService });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "UnitTestAgent/1.0",
        "x-forwarded-for": "203.0.113.10, 198.51.100.10",
      },
      body: JSON.stringify(createValidCommentPayload()),
    });

    expect(response.status).toBe(202);
    expect(commentService.createPending).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: "203.0.113.10",
        userAgent: "UnitTestAgent/1.0",
      }),
    );
  });

  it("rejects invalid comment payload", async () => {
    const app = createApp({ commentService: createMockCommentService() });
    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        postSlug: "2026/demo/index.md",
        authorName: "",
        content: "评论内容",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("rejects disallowed origins for write requests", async () => {
    const app = createApp({
      allowedOrigins: ["https://abeltomato.github.io"],
      commentService: createMockCommentService(),
    });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.example",
      },
      body: JSON.stringify(createValidCommentPayload()),
    });

    expect(response.status).toBe(403);
  });

  it("allows configured origins for write requests", async () => {
    const app = createApp({
      allowedOrigins: ["https://abeltomato.github.io"],
      commentService: createMockCommentService(),
    });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://abeltomato.github.io",
      },
      body: JSON.stringify(createValidCommentPayload()),
    });

    expect(response.status).toBe(202);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://abeltomato.github.io",
    );
  });

  it("requires turnstile token when turnstile is configured", async () => {
    const turnstileService = {
      verify: vi.fn().mockResolvedValue(true),
    };
    const app = createApp({
      commentService: createMockCommentService(),
      turnstileService,
    });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createValidCommentPayload()),
    });

    expect(response.status).toBe(403);
    expect(turnstileService.verify).not.toHaveBeenCalled();
  });

  it("rejects failed turnstile verification", async () => {
    const turnstileService = {
      verify: vi.fn().mockResolvedValue(false),
    };
    const app = createApp({
      commentService: createMockCommentService(),
      turnstileService,
    });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        createValidCommentPayload({ turnstileToken: "invalid-token" }),
      ),
    });

    expect(response.status).toBe(403);
    expect(turnstileService.verify).toHaveBeenCalledWith(
      "invalid-token",
      undefined,
    );
  });

  it("accepts successful turnstile verification", async () => {
    const turnstileService = {
      verify: vi.fn().mockResolvedValue(true),
    };
    const app = createApp({
      commentService: createMockCommentService(),
      turnstileService,
    });

    const response = await app.request("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        createValidCommentPayload({ turnstileToken: "valid-token" }),
      ),
    });

    expect(response.status).toBe(202);
    expect(turnstileService.verify).toHaveBeenCalledWith(
      "valid-token",
      undefined,
    );
  });

  it("rate limits repeated comment submissions", async () => {
    const app = createApp({ commentService: createMockCommentService() });
    const requestInit = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createValidCommentPayload()),
    };

    for (let index = 0; index < 5; index += 1) {
      const response = await app.request("/api/comments", requestInit);
      expect(response.status).toBe(202);
    }

    const response = await app.request("/api/comments", requestInit);
    expect(response.status).toBe(429);
  });
});