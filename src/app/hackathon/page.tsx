import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { hackathonStatus } from "@/lib/utils";
import { JUDGING_CRITERIA, HACKATHON_MEMBERS_PER_TEAM } from "@/lib/constants";

export default async function HackathonPage() {
  let s: Record<string,string> = {};
  try { const rows = await db.select().from(settings); s=Object.fromEntries(rows.map(r=>[r.key,r.value])); } catch {}
  const status = hackathonStatus(s.hackathon_opens||"2026-01-01", s.hackathon_closes||"2026-12-31");
  const categories = (s.hackathon_categories||"").split(",").map(c=>c.trim()).filter(Boolean);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">School Management Hackathon 2026</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Theme: <b className="dark:text-zinc-200">School Management</b> · Unlimited teams · {HACKATHON_MEMBERS_PER_TEAM} members per team · One member per team only · Build from scratch</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Registration: {status.replace("_"," ")} · {s.hackathon_opens||"—"} to {s.hackathon_closes||"—"} · Event: {s.hackathon_date||"TBA"} · {s.hackathon_working_hours ? `${s.hackathon_working_hours} working + ${s.hackathon_break_minutes||30} min break` : "4 hours working + 30 min break (4h 30m total)"}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status==="OPEN"
          ? <Link href="/hackathon/register" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] sm:w-auto">Register Team →</Link>
          : <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-200 px-8 py-3.5 text-[15px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto">Registration {status.replace("_"," ")}</span>}
        <Link href="/hackathon/status" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">Check Team Status</Link>
        <Link href="/hackathon/final" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">Final Submission</Link>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">Rules</h2>
          <div className="mt-3 grid gap-4 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">General</p><ul className="mt-1 list-disc pl-5"><li>Theme is School Management</li><li>Unlimited teams · Exactly {HACKATHON_MEMBERS_PER_TEAM} members per team</li><li>Any class may participate · One team per participant · One Team Leader per team</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">Project</p><ul className="mt-1 list-disc pl-5"><li>Must relate to School Management · Built from scratch during the event</li><li>Every team&apos;s project must be unique · No copying ideas or code</li><li>Pre-built projects not allowed</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">Team & Laptop</p><ul className="mt-1 list-disc pl-5"><li>All 3 members must contribute (research, design, testing, docs, presentation)</li><li>Only the Team Leader may bring/use a laptop for the project</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">Time · AI · Documentation</p><ul className="mt-1 list-disc pl-5"><li>{s.hackathon_working_hours || "4 hours"} working · {s.hackathon_break_minutes || 30} min break</li><li>AI tools allowed — but you must understand your project; judges may quiz any member</li><li>Documentation mandatory</li></ul></div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">Required Documentation</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Every final submission must include docs covering: Team Name, Project Name, Members, Problem Statement, Target Users, Proposed Solution, Main Features, Technology Stack, How It Works, Screenshots/Demo, Challenges, Future Improvements.</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">Categories</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{categories.length ? categories.join(", ") : "Student Management, Attendance, Teacher Management, Exam & Results, Timetable, Homework & Assignments, Library Management, Fee Management, Parent-School Communication, Event Management, Inventory Management, Transport Management, Student Performance, School Analytics, AI-powered School Management, Other"}</p>
          <p className="mt-2 text-xs text-zinc-400">Select &quot;Other&quot; with a custom description if your idea doesn&apos;t fit the listed categories.</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">Final Submission</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Teams submit: working project, source repository, documentation URL, demo URL (where applicable), and team info. Once locked, submissions cannot be changed unless an admin unlocks them.</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">Judging Criteria</h2>
          <div className="mt-3 grid gap-2">
            {JUDGING_CRITERIA.map(c=>(
              <div key={c.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"><span className="dark:text-zinc-200">{c.label}</span><span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">{c.weight}%</span></div>
            ))}
            <div className="flex items-center justify-between px-3 py-1 text-sm font-bold dark:text-zinc-100"><span>Total</span><span>100%</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <h2 className="font-bold text-red-900 dark:text-red-200">Prohibited &amp; Disqualification</h2>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">Copying another team&apos;s project/code/idea, pre-built submissions, using more/fewer than 3 members, joining multiple teams, unauthorized devices, outside developers, hacking school systems or infrastructure, damaging another team&apos;s work, plagiarism, cheating, false information, or serious misconduct may result in disqualification. Organizers &amp; judges have final authority.</p>
        </div>
      </div>
    </div>
  );
}
