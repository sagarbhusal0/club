import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return drizzle(neon("postgresql://user:pass@localhost/db"), { schema });
  }
  return drizzle(neon(url), { schema });
}
export const db = getDb();
