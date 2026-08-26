import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { hackathonStatus } from "@/lib/utils";

export default async function HackathonPage() {
  let s: Record<string,string> = {};
  try { const rows = await db.select().from(settings); s=Object.fromEntries(rows.map(r=>[r.key,r.value])); } catch {}
  const status = hackathonStatus(s.hackathon_opens||"2026-01-01", s.hackathon_closes||"2026-12-31");
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hackathon 2026</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">Form a team of <b className="dark:text-zinc-200">exactly 4 members</b> and build something amazing.</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Registration: {status.replace("_"," ")} · {s.hackathon_opens||"—"} to {s.hackathon_closes||"—"} · Event: {s.hackathon_date||"TBA"}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status==="OPEN"
          ? <Link href="/hackathon/register" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] sm:w-auto">Register Team →</Link>
          : <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-200 px-8 py-3.5 text-[15px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto">Registration {status.replace("_"," ")}</span>}
        <Link href="/hackathon/status" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">Check Team Status</Link>
      </div>
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-bold dark:text-zinc-100">Categories</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.hackathon_categories||"AI/ML, Cybersecurity, Web Development, Software Development, Cloud/DevOps, Open Source"}</p>
      </div>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-bold dark:text-zinc-100">Rules</h2>
        <ul className="mt-2 list-disc pl-6 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Exactly 4 members per team — no more, no less</li>
          <li>One student cannot join multiple teams</li>
          <li>First member is the team leader</li>
          <li>All member details must be complete and valid</li>
        </ul>
      </div>
    </div>
  );
}
