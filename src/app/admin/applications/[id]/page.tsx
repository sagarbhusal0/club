import { db } from "@/db";
import { boardApplications, boardPositions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import StatusUpdate from "../StatusUpdate";

export default async function ApplicationDetail({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [app] = await db.select().from(boardApplications).where(eq(boardApplications.id, id)).limit(1);
  if (!app) notFound();
  const pos = await db.select().from(boardPositions);
  const posMap = new Map(pos.map(p=>[p.id,p.name]));
  const fields: [string,string][] = [
    ["Full Name", app.fullName], ["Email", app.email], ["Phone", app.phone],
    ["Grade", app.grade], ["Section", app.section], ["Student ID", app.studentId],
    ["First Choice", posMap.get(app.firstChoicePositionId||"")||"—"],
    ["Second Choice", posMap.get(app.secondChoicePositionId||"")||"—"],
    ["Technical Interests", app.technicalInterests||"—"],
    ["Expertise", app.expertise||"—"],
    ["Experience", app.experience||"—"],
    ["Leadership", app.leadershipExperience||"—"],
    ["Projects", app.projects||"—"],
    ["Competitions", app.competitions||"—"],
    ["GitHub", app.githubUrl||"—"],
    ["Portfolio", app.portfolioUrl||"—"],
    ["Motivation", app.motivation],
    ["Position Reason", app.positionReason],
    ["Contribution", app.contribution],
    ["Proposed Activities", app.proposedActivities],
    ["Time Commitment", app.timeCommitment],
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3"><h1 className="text-xl font-bold">{app.applicationNumber}</h1><Badge status={app.status} /></div>
      <Card>
        <div className="grid gap-3 text-sm">
          {fields.map(([k,v])=>(
            <div key={k} className="border-b py-2 last:border-0"><span className="text-xs font-semibold uppercase text-zinc-500">{k}</span><p className="mt-1 whitespace-pre-wrap break-words">{v}</p></div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Update Status & Notes</h3>
        <div className="mt-4"><StatusUpdate id={app.id} current={app.status} notes={app.adminNotes} /></div>
      </Card>
    </div>
  );
}
