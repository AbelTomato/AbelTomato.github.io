import { hmacBase64Url, sha256Hex, timingSafeEqual } from "../utils/crypto";

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
      if (!(await safeEqual(await hashPassword(password), adminPasswordHash))) {
        return null;
      }

      const payload = encodeBase64Url(
        JSON.stringify({ sub: "admin", exp: now() + tokenTtlMs }),
      );
      const signature = await sign(payload, jwtSecret);
      return `${payload}.${signature}`;
    },

    async verifyToken(token) {
      const [payload, signature] = token.split(".");

      if (
        !payload ||
        !signature ||
        !(await safeEqual(await sign(payload, jwtSecret), signature))
      ) {
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
  return sha256Hex(password);
}

async function sign(payload: string, secret: string) {
  return hmacBase64Url(secret, payload);
}

function encodeBase64Url(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    Array.from(atob(padBase64(base64)), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
  );
}

async function safeEqual(left: string, right: string) {
  return timingSafeEqual(left, right);
}

function padBase64(value: string) {
  return value.padEnd(Math.ceil(value.length / 4) * 4, "=");
}