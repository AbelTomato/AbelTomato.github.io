import { describe, expect, it, vi } from "vitest";

import { createCommentService } from "./commentService";

describe("comment service", () => {
  it("creates pending comments with hashed email", async () => {
    const repository = {
      listApprovedByPostSlug: vi.fn().mockResolvedValue([]),
      listByStatus: vi.fn().mockResolvedValue([]),
      createPending: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(true),
    };
    const service = createCommentService(repository, { hashSalt: "test-salt" });

    await expect(
      service.createPending({
        postSlug: "2026/demo/index.md",
        parentId: null,
        authorName: "Abel",
        authorEmail: "Name@Example.com",
        content: "评论内容",
        ipAddress: "203.0.113.10",
        userAgent: "UnitTestAgent/1.0",
      }),
    ).resolves.toEqual({
      status: "pending",
      message: "评论已提交，审核后展示",
    });

    expect(repository.createPending).toHaveBeenCalledWith({
      postSlug: "2026/demo/index.md",
      parentId: null,
      authorName: "Abel",
      authorEmailHash:
        "2cb3b90af0127df69d4e61766838b7b72671b8045b8b9c01683ca66237fa2dc2",
      content: "评论内容",
      ipHash:
        "98a413f88ca1681c77823eb5320b2fee0b2c5eb31b937f7cc49a08b8b3b747ff",
      userAgentHash:
        "f1fafdccee03d909f708ba25d27814be8527c8a20a50e2ddd2c1fc11c52ca1b9",
    });
  });
});