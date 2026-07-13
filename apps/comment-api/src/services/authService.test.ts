import { describe, expect, it } from "vitest";

import { createAuthService, hashPassword } from "./authService";

describe("auth service", () => {
  it("returns a valid token for the admin password", async () => {
    const authService = createAuthService({
      adminPasswordHash: hashPassword("secret"),
      jwtSecret: "12345678901234567890123456789012",
      now: () => 1000,
    });

    const token = await authService.login("secret");

    expect(token).toEqual(expect.any(String));
    await expect(authService.verifyToken(token ?? "")).resolves.toBe(true);
  });

  it("rejects invalid passwords", async () => {
    const authService = createAuthService({
      adminPasswordHash: hashPassword("secret"),
      jwtSecret: "12345678901234567890123456789012",
    });

    await expect(authService.login("wrong")).resolves.toBeNull();
  });

  it("rejects expired tokens", async () => {
    let now = 1000;
    const authService = createAuthService({
      adminPasswordHash: hashPassword("secret"),
      jwtSecret: "12345678901234567890123456789012",
      now: () => now,
    });
    const token = await authService.login("secret");

    now = 1000 + 1000 * 60 * 60 * 13;

    await expect(authService.verifyToken(token ?? "")).resolves.toBe(false);
  });
});