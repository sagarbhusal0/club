import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@ictmavi.edu.np";
let password = process.argv[3];
if (!password) {
  password = crypto.randomBytes(9).toString("base64url") + "A1!";
  console.log("Generated password:", password);
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);

const hash = await bcrypt.hash(password, 10);
try {
  await sql`INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', ${email}, ${hash}, 'ADMIN') ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, role='ADMIN'`;
  console.log(`Admin ready: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Login at: http://localhost:3000/login`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const rows = await sql`SELECT email, role FROM users WHERE role='ADMIN'`;
console.log("All admins:", rows.map(r=>r.email).join(", "));
