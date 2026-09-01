import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT email, password_hash, role FROM users`;
console.log("users:", rows.length);
for(const u of rows){
  console.log(u.email, u.role, u.password_hash.slice(0,15)+"...");
  for(const p of ["Sagare1453iu@$", "Sagare1453iu@", "NKop1EDqBW0DA1!"]){
    const ok = await bcrypt.compare(p, u.password_hash);
    console.log("  compare", JSON.stringify(p), "=>", ok);
  }
}
