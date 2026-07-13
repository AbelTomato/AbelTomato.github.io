import { describe, expect, it, vi } from "vitest";

import { createApp } from "../app";
import type { AuthService } from "../services/authService";
import type { CommentService } from "../services/commentService";

function createMockAuthService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    login: vi.fn().mockResolvedValue("admin-token"),
    verifyToken: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

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

describe("admin route", () => {
  it("logs in with a valid password", async () => {
    const authService = createMockAuthService();
    const app = createApp({
      authService,
      commentService: createMockCommentService(),
    });

    const response = await app.request("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "secret" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ token: "admin-token" });
    expect(authService.login).toHaveBeenCalledWith("secret");
  });

  it("rejects invalid admin password", async () => {
    const app = createApp({
      authService: createMockAuthService({ login: vi.fn().mockResolvedValue(null) }),
      commentService: createMockCommentService(),
    });

    const response = await app.request("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });

    expect(response.status).toBe(401);
  });

  it("requires authorization for admin comments", async () => {
    const app = createApp({
      authService: createMockAuthService({
        verifyToken: vi.fn().mockResolvedValue(false),
      }),
      commentService: createMockCommentService(),
    });

    const response = await app.request("/api/admin/comments");

    expect(response.status).toBe(401);
  });

  it("lists comments by status", async () => {
    const commentService = createMockCommentService({
      listByStatus: vi.fn().mockResolvedValue([
        {
          id: "0192f81e-8f9a-7000-9000-111111111111",
          postSlug: "2026/demo/index.md",
          parentId: null,
          authorName: "Abel",
          content: "评论内容",
          createdAt: "2026-07-09T15:00:00.000Z",
          status: "pending",
          authorEmailHash: null,
          ipHash: null,
          userAgentHash: null,
          updatedAt: "2026-07-09T15:00:00.000Z",
        },
      ]),
    });
    const app = createApp({
      authService: createMockAuthService(),
      commentService,
    });

    const response = await app.request("/api/admin/comments?status=pending", {
      headers: { authorization: "Bearer admin-token" },
    });

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
          status: "pending",
          authorEmailHash: null,
          ipHash: null,
          userAgentHash: null,
          updatedAt: "2026-07-09T15:00:00.000Z",
        },
      ],
    });
    expect(commentService.listByStatus).toHaveBeenCalledWith("pending");
  });

  it("updates comment status", async () => {
    const commentService = createMockCommentService();
    const app = createApp({
      authService: createMockAuthService(),
      commentService,
    });

    const response = await app.request(
      "/api/admin/comments/0192f81e-8f9a-7000-9000-111111111111/status",
      {
        method: "PATCH",
        headers: {
          authorization: "Bearer admin-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "approved" });
    expect(commentService.updateStatus).toHaveBeenCalledWith(
      "0192f81e-8f9a-7000-9000-111111111111",
      "approved",
    );
  });

  it("soft deletes comments", async () => {
    const commentService = createMockCommentService();
    const app = createApp({
      authService: createMockAuthService(),
      commentService,
    });

    const response = await app.request(
      "/api/admin/comments/0192f81e-8f9a-7000-9000-111111111111",
      {
        method: "DELETE",
        headers: { authorization: "Bearer admin-token" },
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "deleted" });
    expect(commentService.updateStatus).toHaveBeenCalledWith(
      "0192f81e-8f9a-7000-9000-111111111111",
      "deleted",
    );
  });
});