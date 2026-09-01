import Link from "next/link";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ teamNumber?:string }> }) {
  const { teamNumber } = await searchParams;
  let team: typeof hackathonTeams.$inferSelect | null = null;
  let members: typeof hackathonMembers.$inferSelect[] = [];
  let leader: typeof hackathonMembers.$inferSelect | null = null;
  if (teamNumber) {
    try {
      const [t] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber.toUpperCase().trim())).limit(1);
      if (t) { team = t; members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, t.id)); leader = members.find(m=>m.isLeader) || members[0] || null; }
    } catch {}
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16 text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-3xl">🎉</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Registration Successful</h1>
      {team ? (
        <>
          <p className="mt-2 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{team.teamNumber}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Team: {team.teamName} · {team.projectTitle}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Leader: {leader?.fullName || "—"} · {members.length} members · Status: {team.status} · Idea: {team.ideaStatus}</p>
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900">Save your Team ID — you&apos;ll need it to check status and submit your final project.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/hackathon/status" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Check Team Status →</Link>
            <Link href="/hackathon/final" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900">Final Submission</Link>
          </div>
        </>
      ) : teamNumber ? (
        <>
          <p className="mt-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{teamNumber}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Status: REGISTERED — check your team status page for updates.</p>
          <Link href="/hackathon/status" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white">Check Team Status →</Link>
        </>
      ) : (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No team specified. Check status with your Team ID or email.</p>
      )}
    </div>
  );
}
