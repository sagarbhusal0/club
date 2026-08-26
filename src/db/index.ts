import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[db] DATABASE_URL is not set — queries will fail. Copy .env.example to .env and set DATABASE_URL.");
    return drizzle(neon("postgresql://user:pass@localhost/db"), { schema });
  }
  return drizzle(neon(url), { schema });
}
export const db = getDb();
