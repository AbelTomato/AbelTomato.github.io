import { describe, expect, it } from "vitest";

import { createApp } from "./app";

describe("comment api app", () => {
  it("returns health status", async () => {
    const app = createApp();
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("returns structured 404 errors", async () => {
    const app = createApp();
    const response = await app.request("/missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "请求的资源不存在",
      },
    });
  });
});