import { defineConfig } from "drizzle-kit";

import { loadLocalEnv } from "./src/config/loadEnv";

loadLocalEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/comment_api",
  },
});