import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import TeamStatusUpdate from "../TeamStatusUpdate";

export default async function TeamDetail({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
  if (!team) notFound();
  const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3"><h1 className="text-xl font-bold">{team.teamNumber} — {team.teamName}</h1><Badge status={team.status} /></div>
      <Card>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Project:</span> {team.projectTitle}</p>
          <p><span className="font-semibold">Category:</span> {team.category}</p>
          <p><span className="font-semibold">Description:</span> {team.description}</p>
          {team.problemStatement && <p><span className="font-semibold">Problem:</span> {team.problemStatement}</p>}
          {team.solution && <p><span className="font-semibold">Solution:</span> {team.solution}</p>}
          {team.technologyStack && <p><span className="font-semibold">Stack:</span> {team.technologyStack}</p>}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Members (4)</h3>
        <div className="mt-3 grid gap-3">
          {members.map(m=>(
            <div key={m.id} className={`rounded-lg border p-3 text-sm ${m.isLeader?"bg-indigo-50 border-indigo-200":"bg-white"}`}>
              <p className="font-semibold">{m.fullName} {m.isLeader && <span className="text-xs text-indigo-600">(Leader)</span>}</p>
              <p className="text-xs text-zinc-500">{m.email} · {m.phone} · {m.studentId} · {m.grade} {m.section} · {m.role}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Update Status</h3>
        <div className="mt-4"><TeamStatusUpdate id={team.id} current={team.status} notes={team.adminNotes} /></div>
      </Card>
    </div>
  );
}
