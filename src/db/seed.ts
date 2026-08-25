import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const positions = [
    { name: "President", description: "Lead the club", sortOrder: "1" },
    { name: "Vice President", description: "Support the President", sortOrder: "2" },
    { name: "General Secretary", description: "Manage club operations", sortOrder: "3" },
    { name: "Joint Secretary", description: "Assist Secretary", sortOrder: "4" },
    { name: "Technical Lead", description: "Oversee technical activities", sortOrder: "5" },
    { name: "AI/ML Lead", description: "Lead AI/ML initiatives", sortOrder: "6" },
    { name: "Cybersecurity Lead", description: "Lead security initiatives", sortOrder: "7" },
    { name: "Web/Software Lead", description: "Lead web & software projects", sortOrder: "8" },
    { name: "Cloud/DevOps Lead", description: "Lead cloud & DevOps", sortOrder: "9" },
    { name: "Event Coordinator", description: "Organize events", sortOrder: "10" },
    { name: "Media & Design Lead", description: "Handle media & design", sortOrder: "11" },
    { name: "Treasurer", description: "Manage finances", sortOrder: "12" },
  ];

  for (const p of positions) {
    await sql`INSERT INTO board_positions (name, description, sort_order) VALUES (${p.name}, ${p.description}, ${p.sortOrder}) ON CONFLICT (name) DO NOTHING`;
  }

  const defaults: [string, string][] = [
    ["club_name", "ICT Mavi Imiliya Club"],
    ["club_description", "Learn. Build. Lead."],
    ["contact_email", "ict@mavi.edu.np"],
    ["board_opens", "2026-04-01"],
    ["board_closes", "2026-05-15"],
    ["hackathon_opens", "2026-04-15"],
    ["hackathon_closes", "2026-05-30"],
    ["hackathon_date", "2026-06-15"],
    ["hackathon_categories", "AI/ML,Cybersecurity,Web Development,Software Development,Cloud/DevOps,Open Source,General"],
  ];
  for (const [k, v] of defaults) {
    await sql`INSERT INTO settings (key, value) VALUES (${k}, ${v}) ON CONFLICT (key) DO NOTHING`;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await sql`INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', ${adminEmail}, ${hash}, 'ADMIN') ON CONFLICT (email) DO NOTHING`;
    console.log(`Admin user ready: ${adminEmail}`);
  }

  console.log("Seed complete");
}
seed().catch((e) => { console.error(e); process.exit(1); });
