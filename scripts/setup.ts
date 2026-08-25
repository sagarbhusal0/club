import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const hash = await bcrypt.hash("Sagare1453iu@$", 10);
  await sql`INSERT INTO users (name, email, password_hash, role) VALUES ('Sagar', 'sagar@sagarb.com', ${hash}, 'ADMIN') ON CONFLICT (email) DO UPDATE SET password_hash=${hash}, role='ADMIN'`;
  console.log("admin sagar@sagarb.com synced");
  await sql`INSERT INTO settings (key, value) VALUES ('board_opens','2026-01-01') ON CONFLICT (key) DO UPDATE SET value='2026-01-01'`;
  await sql`INSERT INTO settings (key, value) VALUES ('board_closes','2026-12-31') ON CONFLICT (key) DO UPDATE SET value='2026-12-31'`;
  await sql`INSERT INTO settings (key, value) VALUES ('hackathon_opens','2026-01-01') ON CONFLICT (key) DO UPDATE SET value='2026-01-01'`;
  await sql`INSERT INTO settings (key, value) VALUES ('hackathon_closes','2026-12-31') ON CONFLICT (key) DO UPDATE SET value='2026-12-31'`;
  console.log("registrations open");
}
main().catch(e=>{console.error(e);process.exit(1);});
