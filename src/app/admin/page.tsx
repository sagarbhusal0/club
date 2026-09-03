import Link from "next/link";
import { db } from "@/db";
import { boardApplications, hackathonTeams, hackathonMembers, settings } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Card = { label: string; value: string | number; href?: string; accent?: boolean };

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

  let hackathonOpens = "", hackathonCloses = "";
  let maxTeams = 0;
  try {
    const rows = await db.select().from(settings);
    const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
    maxTeams = Number(s.hackathon_max_teams) || 0;
    hackathonOpens = s.hackathon_opens || "";
    hackathonCloses = s.hackathon_closes || "";
  } catch {}

  const cards: Card[] = [
    { label: "Total Applications", value: stats.totalApps, href: "/admin/applications" },
    { label: "Pending Review", value: stats.pendingApps, href: "/admin/applications?status=SUBMITTED", accent: stats.pendingApps > 0 },
    { label: "Shortlisted", value: stats.shortlisted, href: "/admin/applications?status=SHORTLISTED" },
    { label: "Selected", value: stats.selected, href: "/admin/applications?status=SELECTED" },
    { label: "Total Teams", value: maxTeams > 0 ? `${stats.totalTeams} / ${maxTeams}` : `${stats.totalTeams} (unlimited)`, href: "/admin/teams" },
    { label: "Available Slots", value: maxTeams > 0 ? Math.max(0, maxTeams - stats.totalTeams) : "∞" },
    { label: "Total Participants", value: maxTeams > 0 ? `${stats.totalParticipants} / ${maxTeams * 3}` : stats.totalParticipants },
    { label: "Approved Teams", value: stats.approvedTeams, href: "/admin/teams?status=APPROVED" },
    { label: "Pending Teams", value: stats.pendingTeams, href: "/admin/teams?status=REGISTERED" },
    { label: "Pending Ideas", value: stats.pendingIdeas, href: "/admin/teams?ideaStatus=PENDING", accent: stats.pendingIdeas > 0 },
    { label: "Needs Revision", value: stats.needsRevision, href: "/admin/teams?ideaStatus=NEEDS_REVISION", accent: stats.needsRevision > 0 },
    { label: "Final Submissions", value: stats.finalSubs, href: "/admin/teams?final=yes" },
    { label: "Disqualified", value: stats.disqualified, href: "/admin/teams?status=DISQUALIFIED" },
  ];

  let recentApps: (typeof boardApplications.$inferSelect)[] = [];
  let recentTeams: (typeof hackathonTeams.$inferSelect)[] = [];
  let ideaQueue: (typeof hackathonTeams.$inferSelect)[] = [];
  try {
    recentApps = await db.select().from(boardApplications).orderBy(desc(boardApplications.createdAt)).limit(5);
    recentTeams = await db.select().from(hackathonTeams).orderBy(desc(hackathonTeams.createdAt)).limit(5);
    if (stats.pendingIdeas > 0) {
      ideaQueue = await db.select().from(hackathonTeams).where(eq(hackathonTeams.ideaStatus, "PENDING")).orderBy(desc(hackathonTeams.createdAt)).limit(5);
    }
  } catch {}

  const now = new Date();
  const closesSoon = hackathonCloses ? (new Date(hackathonCloses).getTime() - now.getTime()) / 86_400_000 : NaN;
  const windowLabel = hackathonOpens && hackathonCloses
    ? `${formatDate(hackathonOpens)} → ${formatDate(hackathonCloses)}${closesSoon >= 0 && closesSoon <= 7 ? ` · closes in ${Math.max(1, Math.ceil(closesSoon))} day${Math.ceil(closesSoon) === 1 ? "" : "s"}` : ""}`
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/applications" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97]">Applications</Link>
          <Link href="/admin/teams" className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">Teams</Link>
        </div>
      </div>

      {windowLabel && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="font-semibold dark:text-zinc-100">Hackathon registration window</span>
          <span className="text-zinc-600 dark:text-zinc-400">{windowLabel}</span>
          {maxTeams > 0 && <span className="text-zinc-500 dark:text-zinc-500">· limit {maxTeams} teams</span>}
          <Link href="/admin/settings" className="ml-auto text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">Edit settings →</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {cards.map((card,i)=>{
          const inner = (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.accent ? "text-indigo-600 dark:text-indigo-400" : "dark:text-zinc-100"}`}>{card.value}</p>
            </>
          );
          const cls = `rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${card.href ? "block" : ""}`;
          return card.href ? (
            <Link key={card.label} href={card.href} className={cls} style={{ animation:`fadeUp 320ms var(--ease-out) ${i*40}ms both` }}>{inner}</Link>
          ) : (
            <div key={card.label} className={cls} style={{ animation:`fadeUp 320ms var(--ease-out) ${i*40}ms both` }}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-bold">Latest Applications</h2>
            <Link href="/admin/applications" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">View all →</Link>
          </header>
          {recentApps.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentApps.map(a=>(
                <li key={a.id}>
                  <Link href={`/admin/applications/${a.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                    <span className="min-w-0 break-words dark:text-zinc-100">{a.fullName}<span className="ml-2 font-mono text-xs text-zinc-400">{a.applicationNumber}</span></span>
                    <span className="flex items-center gap-2 text-xs text-zinc-400">{formatDate(a.createdAt)}<Badge status={a.status} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-bold">Latest Teams</h2>
            <Link href="/admin/teams" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">View all →</Link>
          </header>
          {recentTeams.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">No teams yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentTeams.map(t=>(
                <li key={t.id}>
                  <Link href={`/admin/teams/${t.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                    <span className="min-w-0 break-words dark:text-zinc-100">{t.teamName}<span className="ml-2 font-mono text-xs text-zinc-400">{t.teamNumber}</span></span>
                    <span className="flex items-center gap-2 text-xs text-zinc-400">{formatDate(t.createdAt)}<Badge status={t.ideaStatus} /><Badge status={t.status} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {ideaQueue.length > 0 && (
        <section className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30">
          <header className="flex items-center justify-between border-b border-indigo-100 px-4 py-3 dark:border-indigo-900">
            <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Idea Review Queue ({stats.pendingIdeas} pending)</h2>
            <Link href="/admin/teams?ideaStatus=PENDING" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">View all →</Link>
          </header>
          <ul className="divide-y divide-indigo-100 dark:divide-indigo-900">
            {ideaQueue.map(t=>(
              <li key={t.id}>
                <Link href={`/admin/teams/${t.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/40">
                  <span className="min-w-0 break-words text-indigo-900 dark:text-indigo-100">{t.teamName}<span className="ml-2 font-mono text-xs text-indigo-400">{t.teamNumber}</span></span>
                  <span className="min-w-0 max-w-[50%] truncate text-xs text-indigo-700/70 dark:text-indigo-300/70">{t.projectTitle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
