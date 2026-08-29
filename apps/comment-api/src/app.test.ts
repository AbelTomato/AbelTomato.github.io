import { describe, expect, it, vi } from "vitest";

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

  it("logs unexpected errors and returns a generic 500 response", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = createApp();

    app.get("/boom", () => {
      throw new Error("boom");
    });

    const response = await app.request("/boom");

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误",
      },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled request error", {
      name: "Error",
      message: "boom",
    });

    consoleErrorSpy.mockRestore();
  });
});