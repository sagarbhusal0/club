import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import fs from "fs";

const sql = neon(process.env.DATABASE_URL);
const raw = fs.readFileSync("drizzle/0000_spotty_killraven.sql", "utf8");
const stmts = raw.split("--> statement-breakpoint").map(s=>s.trim()).filter(Boolean);
for (const s of stmts) {
  try { await sql.query(s); console.log("OK", s.slice(0,80).replace(/\n/g," ")); }
  catch(e){ console.log("ERR", e.message.slice(0,300)); }
}
console.log("done");
