import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { AppConfig } from "../config";
import * as schema from "./schema";

export function createDb(config: Pick<AppConfig, "databaseUrl">) {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  const client = postgres(config.databaseUrl, {
    max: 1,
  });

  return drizzle(client, { schema });
}

export type CommentDb = ReturnType<typeof createDb>;