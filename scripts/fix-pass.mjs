import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
const sql = neon(process.env.DATABASE_URL);
const password = "Sagare1453iu@$";
const hash = await bcrypt.hash(password, 10);
console.log("hash", hash.slice(0,20)+"...");
await sql`UPDATE users SET password_hash = ${hash} WHERE email = 'sagar@sagarb.com'`;
console.log("updated sagar@sagarb.com");
// delete bogus entries created by escaping
try { await sql.query("DELETE FROM users WHERE email LIKE '%Sagare1453%'"); console.log("cleaned bogus"); } catch(e){ console.log(e.message)}
const rows = await sql`SELECT email FROM users WHERE role='ADMIN'`;
console.log("admins:", rows.map(r=>r.email).join(", "));
