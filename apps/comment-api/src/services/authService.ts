import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface AuthService {
  login(password: string): Promise<string | null>;
  verifyToken(token: string): Promise<boolean>;
}

interface AuthServiceOptions {
  adminPasswordHash: string;
  jwtSecret: string;
  now?: () => number;
}

const tokenTtlMs = 1000 * 60 * 60 * 12;

export function createAuthService({
  adminPasswordHash,
  jwtSecret,
  now = Date.now,
}: AuthServiceOptions): AuthService {
  return {
    async login(password) {
      if (!safeEqual(hashPassword(password), adminPasswordHash)) {
        return null;
      }

      const payload = encodeBase64Url(
        JSON.stringify({ sub: "admin", exp: now() + tokenTtlMs }),
      );
      const signature = sign(payload, jwtSecret);
      return `${payload}.${signature}`;
    },

    async verifyToken(token) {
      const [payload, signature] = token.split(".");

      if (!payload || !signature || !safeEqual(sign(payload, jwtSecret), signature)) {
        return false;
      }

      try {
        const parsed = JSON.parse(decodeBase64Url(payload)) as {
          sub?: string;
          exp?: number;
        };

        return parsed.sub === "admin" && typeof parsed.exp === "number" && parsed.exp > now();
      } catch {
        return false;
      }
    },
  };
}

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.byteLength === rightBuffer.byteLength &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}