import Link from "next/link";
import { db } from "@/db";
import { boardApplications, hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function AdminDashboard() {
  let stats = { totalApps:0, pendingApps:0, shortlisted:0, selected:0, totalTeams:0, approvedTeams:0, pendingTeams:0, totalParticipants:0, pendingIdeas:0, needsRevision:0, finalSubs:0, disqualified:0 };
  try {
    const [a1] = await db.select({ c: sql<number>`count(*)` }).from(boardApplications);
    const [a2] = await db.select({ c: sql<number>`count(*)` }).from(boardApplications).where(eq(boardApplications.status,"SUBMITTED"));
    const [a3] = await db.select({ c: sql<number>`count(*)` }).from(boardApplications).where(eq(boardApplications.status,"SHORTLISTED"));
    const [a4] = await db.select({ c: sql<number>`count(*)` }).from(boardApplications).where(eq(boardApplications.status,"SELECTED"));
    const [t1] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams);
    const [t2] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.status,"APPROVED"));
    const [t3] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.status,"REGISTERED"));
    const [m1] = await db.select({ c: sql<number>`count(*)` }).from(hackathonMembers);
    const [h1] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.ideaStatus,"PENDING"));
    const [h2] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.ideaStatus,"NEEDS_REVISION"));
    const [h3] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.isFinalSubmitted,true));
    const [h4] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams).where(eq(hackathonTeams.status,"DISQUALIFIED"));
    stats = { totalApps: Number(a1.c), pendingApps: Number(a2.c), shortlisted: Number(a3.c), selected: Number(a4.c), totalTeams: Number(t1.c), approvedTeams: Number(t2.c), pendingTeams: Number(t3.c), totalParticipants: Number(m1.c), pendingIdeas: Number(h1.c), needsRevision: Number(h2.c), finalSubs: Number(h3.c), disqualified: Number(h4.c) };
  } catch {}

  const cards = [
    ["Total Applications", stats.totalApps],
    ["Pending", stats.pendingApps],
    ["Shortlisted", stats.shortlisted],
    ["Selected", stats.selected],
    ["Total Teams", `${stats.totalTeams} / 9`],
    ["Available Slots", 9 - stats.totalTeams],
    ["Total Participants", `${stats.totalParticipants} / 27`],
    ["Approved Teams", stats.approvedTeams],
    ["Pending Teams", stats.pendingTeams],
    ["Pending Ideas", stats.pendingIdeas],
    ["Needs Revision", stats.needsRevision],
    ["Final Submissions", stats.finalSubs],
    ["Disqualified", stats.disqualified],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map(([label,val],i)=>(
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900" style={{ animation:`fadeUp 320ms var(--ease-out) ${i*40}ms both` }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-bold dark:text-zinc-100">{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/admin/applications" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97]">View Applications</Link>
        <Link href="/admin/teams" className="rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">View Teams</Link>
      </div>
    </div>
  );
}
