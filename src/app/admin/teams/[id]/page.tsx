import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import TeamStatusUpdate from "../TeamStatusUpdate";
import IdeaStatusUpdate from "./IdeaStatusUpdate";
import FinalUnlockButton from "./FinalUnlockButton";
export default async function TeamDetail({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
  if (!team) notFound();
  const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-bold">{team.teamNumber} - {team.teamName}</h1><Badge status={team.status} /><Badge status={team.ideaStatus} />{team.isFinalSubmitted && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">Final locked</span>}</div>
      <Card><h3 className="font-bold">Team and Project</h3><div className="mt-2 space-y-2 text-sm"><p><span className="font-semibold">Project:</span> {team.projectTitle}</p><p><span className="font-semibold">Category:</span> {team.category}</p><p><span className="font-semibold">Description:</span> {team.description}</p>{team.problemStatement && <p><span className="font-semibold">Problem:</span> {team.problemStatement}</p>}{team.solution && <p><span className="font-semibold">Solution:</span> {team.solution}</p>}{team.technologyStack && <p><span className="font-semibold">Stack:</span> {team.technologyStack}</p>}{team.projectIdeaSummary && <p><span className="font-semibold">Idea Summary:</span> {team.projectIdeaSummary}</p>}</div></Card>
      <Card><h3 className="font-bold">Idea Review</h3><div className="mt-4"><IdeaStatusUpdate id={team.id} current={team.ideaStatus} notes={team.adminNotes} /></div></Card>
      <Card><h3 className="font-bold">Members ({members.length} / 3)</h3><div className="mt-3 grid gap-3">{members.map(m=>(<div key={m.id} className={"rounded-lg border p-3 text-sm "+(m.isLeader?"bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800":"bg-white dark:bg-zinc-900 dark:border-zinc-700")}><p className="font-semibold">{m.fullName} {m.isLeader && <span className="text-xs text-indigo-600">(Leader - laptop)</span>}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{m.email} - {m.phone} - {m.studentId} - {m.grade} {m.section} - {m.role}{m.githubUrl ? " - "+m.githubUrl : ""}</p></div>))}</div></Card>
      <Card><h3 className="font-bold">Final Submission</h3><div className="mt-2 space-y-1 text-sm"><p><span className="font-semibold">Repository:</span> {team.repositoryUrl ? <a href={team.repositoryUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline dark:text-indigo-400">{team.repositoryUrl}</a> : "-"}</p><p><span className="font-semibold">Demo:</span> {team.finalDemoUrl ? <a href={team.finalDemoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline dark:text-indigo-400">{team.finalDemoUrl}</a> : "-"}</p><p><span className="font-semibold">Docs:</span> {team.documentationUrl ? <a href={team.documentationUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline dark:text-indigo-400">{team.documentationUrl}</a> : "-"}</p><p><span className="font-semibold">AI tools:</span> {team.aiToolsUsed || "-"}</p><p><span className="font-semibold">Original confirmed:</span> {team.originalWorkConfirmed ? "Yes" : "No"}</p><p><span className="font-semibold">Final submitted:</span> {team.isFinalSubmitted ? (team.finalSubmittedAt ? new Date(team.finalSubmittedAt).toLocaleString() : "Yes") : "No"}</p></div>{team.isFinalSubmitted && <div className="mt-3"><FinalUnlockButton id={team.id} /></div>}</Card>
      <Card><h3 className="font-bold">Update Team Status</h3><div className="mt-4"><TeamStatusUpdate id={team.id} current={team.status} notes={team.adminNotes} /></div></Card>
    </div>
  );
}
