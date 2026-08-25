import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { boardApplications } from "@/db/schema";
import { toCsv } from "@/lib/utils";

export async function GET() {
  const s = await requireAdmin();
  if (!s) return new Response("Unauthorized",{status:401});
  const rows = await db.select().from(boardApplications);
  const headers = ["applicationNumber","fullName","email","phone","grade","section","studentId","status","createdAt"];
  const csv = toCsv(rows as never, headers);
  return new Response(csv,{ headers:{ "Content-Type":"text/csv", "Content-Disposition":"attachment; filename=applications.csv" }});
}
