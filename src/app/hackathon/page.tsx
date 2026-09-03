import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { hackathonStatus } from "@/lib/utils";
import { JUDGING_CRITERIA, HACKATHON_MEMBERS_PER_TEAM } from "@/lib/constants";
import { getLocale } from "@/lib/i18n-server";
import { makeT, categoryLabel } from "@/lib/i18n";

export default async function HackathonPage() {
  let s: Record<string,string> = {};
  try { const rows = await db.select().from(settings); s=Object.fromEntries(rows.map(r=>[r.key,r.value])); } catch {}
  const status = hackathonStatus(s.hackathon_opens||"2026-01-01", s.hackathon_closes||"2026-12-31");
  const categories = (s.hackathon_categories||"").split(",").map(c=>c.trim()).filter(Boolean);
  const locale = await getLocale();
  const t = makeT(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("hackathonPage.title")}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("hackathonPage.theme")} <b className="dark:text-zinc-200">{t("hackathonPage.themeName")}</b> · {t("hackathonPage.unlimitedTeams")} · {HACKATHON_MEMBERS_PER_TEAM} {t("hackathonPage.membersPerTeam")} · {t("hackathonPage.oneMemberOnly")} · {t("hackathonPage.buildFromScratch")}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonPage.registration")} {t(`statuses.${status}`)} · {s.hackathon_opens||"—"} → {s.hackathon_closes||"—"} · {t("hackathonPage.event")}: {s.hackathon_date||t("home.tba")} · {s.hackathon_working_hours ? `${s.hackathon_working_hours} ${t("hackathonPage.working")} + ${s.hackathon_break_minutes||30} ${t("hackathonPage.minBreak")}` : "4h + 30min"}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status==="OPEN"
          ? <Link href="/hackathon/register" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] sm:w-auto">{t("hackathonPage.registerTeam")}</Link>
          : <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-200 px-8 py-3.5 text-[15px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto">{t("hackathonPage.registration")} {t(`statuses.${status}`)}</span>}
        <Link href="/hackathon/status" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">{t("hackathonPage.checkTeamStatus")}</Link>
        <Link href="/hackathon/final" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">{t("hackathonPage.finalSubmission")}</Link>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">{t("hackathonPage.rules")}</h2>
          <div className="mt-3 grid gap-4 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonPage.general")}</p><ul className="mt-1 list-disc pl-5"><li>{t("hackathonPage.themeIs")}</li><li>{t("hackathonPage.unlimitedRegistration")} · {s.hackathon_max_teams || 9} {t("hackathonPage.teamSlotsAvailable")}</li><li>{t("hackathonPage.exactlyMembers")}</li><li>{t("hackathonPage.anyClass")} · {t("hackathonPage.oneTeamPerParticipant")} · {t("hackathonPage.oneLeader")}</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonPage.project")}</p><ul className="mt-1 list-disc pl-5"><li>{t("hackathonPage.mustRelate")} · {t("hackathonPage.builtFromScratch")}</li><li>{t("hackathonPage.uniqueProject")} · {t("hackathonPage.noCopying")}</li><li>{t("hackathonPage.noPrebuilt")}</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonPage.teamLaptop")}</p><ul className="mt-1 list-disc pl-5"><li>{t("hackathonPage.allContribute")}</li><li>{t("hackathonPage.onlyLeaderLaptop")}</li></ul></div>
            <div><p className="font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonPage.timeAiDocs")}</p><ul className="mt-1 list-disc pl-5"><li>{s.hackathon_working_hours || "4h"} {t("hackathonPage.working")} · {s.hackathon_break_minutes || 30} {t("hackathonPage.minBreak")}</li><li>{t("hackathonPage.aiAllowed")}</li><li>{t("hackathonPage.docsMandatory")}</li></ul></div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">{t("hackathonPage.requiredDocs")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("final.docsNote")}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">{t("hackathonPage.categories")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{categories.length ? categories.map(c=>categoryLabel(locale,c)).join(", ") : t("hackathonPage.categoriesNote")}</p>
          <p className="mt-2 text-xs text-zinc-400">{t("hackathonPage.categoriesNote")}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">{t("hackathonPage.finalTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("hackathonPage.docsNote")}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold dark:text-zinc-100">{t("hackathonPage.judgingCriteria")}</h2>
          <div className="mt-3 grid gap-2">
            {JUDGING_CRITERIA.map(c=>(
              <div key={c.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"><span className="dark:text-zinc-200">{t(`judging.${c.label}`)}</span><span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">{c.weight}%</span></div>
            ))}
            <div className="flex items-center justify-between px-3 py-1 text-sm font-bold dark:text-zinc-100"><span>{t("hackathonPage.total")}</span><span>100%</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <h2 className="font-bold text-red-900 dark:text-red-200">{t("hackathonPage.prohibited")}</h2>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">{t("hackathonPage.prohibitedDesc")}</p>
        </div>
      </div>
    </div>
  );
}
