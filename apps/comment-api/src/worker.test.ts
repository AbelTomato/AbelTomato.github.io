import { beforeEach, describe, expect, it, vi } from "vitest";

const createAppMock = vi.hoisted(() => vi.fn());
const loadConfigMock = vi.hoisted(() => vi.fn());
const createDbMock = vi.hoisted(() => vi.fn());
const createRepositoryMock = vi.hoisted(() => vi.fn());
const createCommentServiceMock = vi.hoisted(() => vi.fn());
const createAuthServiceMock = vi.hoisted(() => vi.fn());
const createTurnstileServiceMock = vi.hoisted(() => vi.fn());

vi.mock("./app", () => ({
  createApp: createAppMock,
}));

vi.mock("./config", () => ({
  loadConfig: loadConfigMock,
}));

vi.mock("./db/client", () => ({
  createDb: createDbMock,
}));

vi.mock("./repositories/commentRepository", () => ({
  createDrizzleCommentRepository: createRepositoryMock,
}));

vi.mock("./services/commentService", () => ({
  createCommentService: createCommentServiceMock,
}));

vi.mock("./services/authService", () => ({
  createAuthService: createAuthServiceMock,
}));

vi.mock("./services/turnstileService", () => ({
  createTurnstileService: createTurnstileServiceMock,
}));

describe("worker", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    loadConfigMock.mockReturnValue({
      port: 8787,
      nodeEnv: "production",
      databaseUrl: "postgres://user:pass@localhost:5432/comment_api",
      hyperdriveConnectionString: undefined,
      adminPasswordHash: "2bb80d537b1da3e38bd30361aa855686bde0ba0a31199529c70f4b5f3a3705b0",
      jwtSecret: "12345678901234567890123456789012",
      allowedOrigins: ["https://abeltomato.github.io"],
      turnstileSecretKey: "turnstile-secret",
      hashSalt: "1234567890abcdef",
    });

    createDbMock.mockReturnValue({ db: true });
    createRepositoryMock.mockReturnValue({ repo: true });
    createCommentServiceMock.mockReturnValue({ service: true });
    createAuthServiceMock.mockReturnValue({ auth: true });
    createTurnstileServiceMock.mockReturnValue({ turnstile: true });
    createAppMock.mockImplementation(() => ({
      fetch: vi.fn().mockResolvedValue(new Response("ok")),
    }));
  });

  it("creates a fresh database client for each request", async () => {
    const worker = await import("./worker");

    await worker.default.fetch(new Request("https://example.com/one"), {});
    await worker.default.fetch(new Request("https://example.com/two"), {});

    expect(createDbMock).toHaveBeenCalledTimes(2);
    expect(createAppMock).toHaveBeenCalledTimes(2);
    expect(createRepositoryMock).toHaveBeenCalledTimes(2);
    expect(createCommentServiceMock).toHaveBeenCalledTimes(2);
    expect(createAuthServiceMock).toHaveBeenCalledTimes(2);
    expect(createTurnstileServiceMock).toHaveBeenCalledTimes(2);
  });
});