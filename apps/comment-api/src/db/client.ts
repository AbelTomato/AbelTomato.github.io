import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { AppConfig } from "../config";
import * as schema from "./schema";

export function createDb(config: Pick<AppConfig, "databaseUrl" | "hyperdriveConnectionString">) {
  const connectionString = config.hyperdriveConnectionString ?? config.databaseUrl;

  if (!connectionString) {
    throw new Error("DATABASE_URL or HYPERDRIVE_CONNECTION_STRING is required to create a database client");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
    fetch_types: false,
  });

  return drizzle(client, { schema });
}

export type CommentDb = ReturnType<typeof createDb>;