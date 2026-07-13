import { describe, expect, it, vi } from "vitest";

import { createDrizzleCommentRepository } from "./commentRepository";

describe("drizzle comment repository", () => {
  it("maps approved comments to public comments", async () => {
    const row = {
      id: "0192f81e-8f9a-7000-9000-111111111111",
      postSlug: "2026/demo/index.md",
      parentId: null,
      authorName: "Abel",
      content: "评论内容",
      createdAt: new Date("2026-07-09T15:00:00.000Z"),
    };
    const orderBy = vi.fn().mockResolvedValue([row]);
    const where = vi.fn(() => ({ orderBy }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const db = { select };
    const repository = createDrizzleCommentRepository(db as never);

    await expect(
      repository.listApprovedByPostSlug("2026/demo/index.md"),
    ).resolves.toEqual([
      {
        ...row,
        createdAt: "2026-07-09T15:00:00.000Z",
      },
    ]);
  });

  it("inserts pending comments", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values }));
    const db = { insert };
    const repository = createDrizzleCommentRepository(db as never);

    await repository.createPending({
      postSlug: "2026/demo/index.md",
      parentId: null,
      authorName: "Abel",
      authorEmailHash:
        "7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068",
      content: "评论内容",
      ipHash:
        "98a413f88ca1681c77823eb5320b2fee0b2c5eb31b937f7cc49a08b8b3b747ff",
      userAgentHash:
        "f1fafdccee03d909f708ba25d27814be8527c8a20a50e2ddd2c1fc11c52ca1b9",
    });

    expect(values).toHaveBeenCalledWith({
      postSlug: "2026/demo/index.md",
      parentId: null,
      authorName: "Abel",
      authorEmailHash:
        "7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068",
      content: "评论内容",
      ipHash:
        "98a413f88ca1681c77823eb5320b2fee0b2c5eb31b937f7cc49a08b8b3b747ff",
      userAgentHash:
        "f1fafdccee03d909f708ba25d27814be8527c8a20a50e2ddd2c1fc11c52ca1b9",
      status: "pending",
    });
  });

  it("updates comment status", async () => {
    const returning = vi.fn().mockResolvedValue([
      { id: "0192f81e-8f9a-7000-9000-111111111111" },
    ]);
    const where = vi.fn(() => ({ returning }));
    const set = vi.fn(() => ({ where }));
    const update = vi.fn(() => ({ set }));
    const db = { update };
    const repository = createDrizzleCommentRepository(db as never);

    await expect(
      repository.updateStatus(
        "0192f81e-8f9a-7000-9000-111111111111",
        "approved",
      ),
    ).resolves.toBe(true);
  });
});