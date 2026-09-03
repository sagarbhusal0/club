import { db } from "@/db";
import { settings, hackathonTeams } from "@/db/schema";
import { hackathonStatus } from "@/lib/utils";
import { sql } from "drizzle-orm";
import HackathonForm from "./HackathonForm";
import { getLocale } from "@/lib/i18n-server";
import { makeT } from "@/lib/i18n";

export default async function RegisterPage() {
  let s: Record<string,string> = {};
  try { const rows = await db.select().from(settings); s=Object.fromEntries(rows.map(r=>[r.key,r.value])); } catch {}
  const status = hackathonStatus(s.hackathon_opens||"2026-01-01", s.hackathon_closes||"2026-12-31");
  const categories = (s.hackathon_categories||"").split(",").map(c=>c.trim()).filter(Boolean);
  const fallback = ["Student Management","Attendance","Teacher Management","Exam & Results","Timetable","Homework & Assignments","Library Management","Fee Management","Parent-School Communication","Event Management","Inventory Management","Transport Management","Student Performance","School Analytics","AI-powered School Management","Other"];
  const cats = categories.length ? categories : fallback;
  let count = 0;
  try { const [r] = await db.select({ c: sql<number>`count(*)` }).from(hackathonTeams); count = Number(r.c); } catch {}
  const maxTeams = Number(s.hackathon_max_teams) || 0;
  const locale = await getLocale();
  const t = makeT(locale);
  if (status !== "OPEN") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("register.closedTitle")} {t(`statuses.${status}`)}</h1>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-900 dark:text-amber-200">{t("register.registrationIs")} {t(`statuses.${status}`)}.</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-300">{t("register.checkBack")}</p>
          <a href="/hackathon/status" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">{t("register.checkTeamStatus")}</a>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("register.title")}</h1>
        <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">{count} {t("register.registered")} · {maxTeams > 0 ? `${maxTeams} ${t("register.slots")}` : t("register.unlimitedSlots")} · {count * 3} {t("register.participants")}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("register.themeLine")} · {t("register.unlimitedRegistration")}{maxTeams > 0 ? ` — ${t("register.onlySlotsSelected")} ${maxTeams} ${t("register.teamSlots")} (${maxTeams * 3} ${t("register.participants")})` : ""} · {t("register.exactly3")} · {t("register.oneLeader")} · {t("register.builtScratch")}</p>
      <div className="mt-6"><HackathonForm categories={cats} maxTeams={maxTeams} /></div>
    </div>
  );
}
