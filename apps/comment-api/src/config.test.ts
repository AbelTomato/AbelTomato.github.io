import { describe, expect, it } from "vitest";

import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("uses defaults when optional values are missing", () => {
    expect(loadConfig({})).toEqual({
      port: 8787,
      nodeEnv: "development",
      databaseUrl: undefined,
      adminPasswordHash: undefined,
      jwtSecret: undefined,
      allowedOrigins: ["http://localhost:4321"],
      turnstileSecretKey: undefined,
      hashSalt: undefined,
    });
  });

  it("parses a custom port", () => {
    expect(
      loadConfig({
        PORT: "3001",
        NODE_ENV: "test",
        DATABASE_URL: "postgres://user:pass@localhost:5432/comment_api",
        COMMENT_ADMIN_PASSWORD_HASH:
          "2bb80d537b1da3e38bd30361aa855686bde0ba0a31199529c70f4b5f3a3705b0",
        COMMENT_JWT_SECRET: "12345678901234567890123456789012",
        COMMENT_ALLOWED_ORIGINS:
          "https://abeltomato.github.io, http://localhost:4321",
        TURNSTILE_SECRET_KEY: "secret",
        COMMENT_HASH_SALT: "1234567890abcdef",
      }),
    ).toEqual({
      port: 3001,
      nodeEnv: "test",
      databaseUrl: "postgres://user:pass@localhost:5432/comment_api",
      adminPasswordHash:
        "2bb80d537b1da3e38bd30361aa855686bde0ba0a31199529c70f4b5f3a3705b0",
      jwtSecret: "12345678901234567890123456789012",
      allowedOrigins: ["https://abeltomato.github.io", "http://localhost:4321"],
      turnstileSecretKey: "secret",
      hashSalt: "1234567890abcdef",
    });
  });

  it("rejects an invalid database url", () => {
    expect(() => loadConfig({ DATABASE_URL: "not-a-url" })).toThrow();
  });

  it("rejects an invalid port", () => {
    expect(() => loadConfig({ PORT: "70000" })).toThrow();
  });

  it("rejects a short jwt secret", () => {
    expect(() => loadConfig({ COMMENT_JWT_SECRET: "short" })).toThrow();
  });

  it("rejects a short hash salt", () => {
    expect(() => loadConfig({ COMMENT_HASH_SALT: "short" })).toThrow();
  });

  it("requires hash salt when database is configured", () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: "postgres://user:pass@localhost:5432/comment_api",
      }),
    ).toThrow();
  });
});