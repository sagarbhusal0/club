import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";

neonConfig.webSocketConstructor = ws;

type WsDb = ReturnType<typeof drizzle<typeof schema>>;
export type Tx = Parameters<Parameters<WsDb["transaction"]>[0]>[0];

// neon-http does not support transactions; use the WebSocket driver for real
// (atomic, concurrency-safe) transactions.
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const pool = new Pool({ connectionString: url });
  try {
    const txDb = drizzle(pool, { schema });
    return await txDb.transaction(fn);
  } finally {
    await pool.end();
  }
}
