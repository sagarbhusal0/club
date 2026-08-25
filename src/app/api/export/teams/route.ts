import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toCsv } from "@/lib/utils";

export async function GET() {
  const s = await requireAdmin();
  if (!s) return new Response("Unauthorized",{status:401});
  const teams = await db.select().from(hackathonTeams);
  const rows: Record<string,unknown>[] = [];
  for (const t of teams) {
    const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, t.id));
    rows.push({ teamNumber:t.teamNumber, teamName:t.teamName, projectTitle:t.projectTitle, category:t.category, status:t.status, members: members.map(m=>`${m.fullName} (${m.studentId})`).join("; ") });
  }
  const headers = ["teamNumber","teamName","projectTitle","category","status","members"];
  const csv = toCsv(rows, headers);
  return new Response(csv,{ headers:{ "Content-Type":"text/csv", "Content-Disposition":"attachment; filename=teams.csv" }});
}
