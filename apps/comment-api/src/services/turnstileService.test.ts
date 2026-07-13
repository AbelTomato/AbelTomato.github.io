import { afterEach, describe, expect, it, vi } from "vitest";

import { createTurnstileService } from "./turnstileService";

describe("turnstile service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for successful verification", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }),
    );

    await expect(
      createTurnstileService("secret").verify("token", "127.0.0.1"),
    ).resolves.toBe(true);
  });

  it("returns false for failed verification", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: false }),
      }),
    );

    await expect(createTurnstileService("secret").verify("token")).resolves.toBe(
      false,
    );
  });

  it("returns false for non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn(),
      }),
    );

    await expect(createTurnstileService("secret").verify("token")).resolves.toBe(
      false,
    );
  });
});