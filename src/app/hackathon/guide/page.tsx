import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { hackathonStatus } from "@/lib/utils";
import { DEFAULT_CATEGORIES, HACKATHON_MAX_TEAMS, HACKATHON_MEMBERS_PER_TEAM, JUDGING_CRITERIA } from "@/lib/constants";
import { getLocale } from "@/lib/i18n-server";
import { makeT, categoryLabel } from "@/lib/i18n";
import GuideNav from "@/components/hackathon/GuideNav";
import FAQAccordion from "@/components/hackathon/FAQAccordion";
import ChecklistCard from "@/components/hackathon/ChecklistCard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = makeT(locale);
  return {
    title: t("hackathonGuide.metaTitle"),
    description: t("hackathonGuide.metaDesc"),
  };
}

export default async function HackathonGuidePage() {
  let s: Record<string, string> = {};
  try {
    const rows = await db.select().from(settings);
    s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {}
  const status = hackathonStatus(s.hackathon_opens || "2026-01-01", s.hackathon_closes || "2026-12-31");
  const categories = (s.hackathon_categories || "").split(",").map((c) => c.trim()).filter(Boolean);
  const displayCategories = categories.length ? categories : [...DEFAULT_CATEGORIES];
  const maxTeams = Number(s.hackathon_max_teams) || HACKATHON_MAX_TEAMS;
  const locale = await getLocale();
  const t = makeT(locale);

  const sections = [
    { id: "overview", label: t("hackathonGuide.navLabels.overview") },
    { id: "rules", label: t("hackathonGuide.navLabels.rules") },
    { id: "how-it-works", label: t("hackathonGuide.navLabels.howItWorks") },
    { id: "ideas", label: t("hackathonGuide.navLabels.ideas") },
    { id: "preparation", label: t("hackathonGuide.navLabels.preparation") },
    { id: "youtube", label: t("hackathonGuide.navLabels.youtube") },
    { id: "ai", label: t("hackathonGuide.navLabels.aiGuide") },
    { id: "team-prep", label: t("hackathonGuide.navLabels.teamPrep") },
    { id: "roles", label: t("hackathonGuide.navLabels.roles") },
    { id: "bring", label: t("hackathonGuide.navLabels.bring") },
    { id: "docs", label: t("hackathonGuide.navLabels.docs") },
    { id: "judging", label: t("hackathonGuide.navLabels.judging") },
    { id: "mindset", label: t("hackathonGuide.navLabels.mindset") },
    { id: "faq", label: t("hackathonGuide.navLabels.faq") },
    { id: "checklist", label: t("hackathonGuide.navLabels.checklist") },
  ];

  const overviewCards = [
    { icon: "👥", key: "members" as const },
    { icon: "⭐", key: "leader" as const },
    { icon: "💻", key: "laptop" as const },
    { icon: "🔨", key: "scratch" as const },
    { icon: "✨", key: "original" as const },
    { icon: "🤖", key: "aiAllowed" as const },
    { icon: "🧠", key: "understand" as const },
    { icon: "🏫", key: "theme" as const },
  ];

  const faqItems: { q: string; a: string }[] = t("hackathonGuide.faqItems") as unknown as { q: string; a: string }[];
  const checklistLabels: string[] = t("hackathonGuide.checklistItems") as unknown as string[];
  const checklistItems = checklistLabels.map((label, i) => ({ id: `c${i + 1}`, label }));

  const yt = (k: string) => t(`hackathonGuide.youtubeTitles.${k}`);
  const docsItems: { k: string; d: string }[] = t("hackathonGuide.docsItems") as unknown as { k: string; d: string }[];
  const mindsetItems: string[] = t("hackathonGuide.mindsetItems") as unknown as string[];
  const howSteps: { n: string; t: string; d: string }[] = t("hackathonGuide.howItWorksSteps") as unknown as { n: string; t: string; d: string }[];

  return (
    <div className="overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-4 py-4 sm:px-4 sm:py-8" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/hackathon" className="inline-flex min-h-11 items-center gap-1 rounded-full px-2.5 py-2 text-[15px] font-medium text-zinc-600 active:bg-zinc-100 active:text-zinc-900 dark:text-zinc-400 dark:active:bg-zinc-800 sm:min-h-0 sm:px-0 sm:py-0 sm:text-sm sm:font-medium">
            {t("hackathonGuide.backToHackathon")}
          </Link>
          <span className="hidden text-zinc-300 dark:text-zinc-600 sm:inline">·</span>
          <Link href="/hackathon/status" className="inline-flex min-h-11 items-center rounded-full px-2.5 py-2 text-[15px] font-medium text-zinc-600 active:bg-zinc-100 active:text-zinc-900 dark:text-zinc-400 dark:active:bg-zinc-800 sm:min-h-0 sm:px-0 sm:py-0 sm:text-sm">
            {t("hackathonGuide.checkTeamStatus")}
          </Link>
        </div>

        <div className="mt-4 min-w-0 overflow-hidden rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:mt-6 sm:p-8" style={{ animation: "fadeUp 220ms var(--ease-out) both" }}>
          <p className="break-words text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{t("hackathonGuide.kicker")}</p>
          <h1 className="mt-2 break-words text-[26px] font-bold leading-[0.95] tracking-[-0.03em] text-zinc-900 dark:text-zinc-100 sm:text-[36px]">{t("hackathonGuide.heroTitle")}</h1>
          <p className="mt-3 max-w-[60ch] break-words text-[15px] leading-6 text-zinc-600 dark:text-zinc-400 sm:text-sm">{t("hackathonGuide.heroDesc")}</p>
          <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
            {[
              t("hackathonGuide.badges.schoolManagement"),
              `${HACKATHON_MEMBERS_PER_TEAM} ${t("hackathonGuide.badges.membersPerTeam")}`,
              t("hackathonGuide.badges.oneLaptop"),
              t("hackathonGuide.badges.buildFromScratch"),
              `${maxTeams} ${t("hackathonGuide.badges.teamsMax")}`,
              t("hackathonGuide.badges.aiAllowed"),
              t("hackathonGuide.badges.originalWork"),
              t("hackathonGuide.badges.workingBreak").replace("{break}", s.hackathon_break_minutes || "30"),
            ].map((b) => (
              <span key={b} className="inline-flex rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium">
                {b}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3 sm:flex-row">
            {status === "OPEN" ? (
              <Link href="/hackathon/register" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] sm:w-auto sm:px-8">
                {t("hackathonGuide.registerTeam")}
              </Link>
            ) : (
              <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-200 px-6 py-3.5 text-[15px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto sm:px-8">
                Registration {t(`statuses.${status}`)}
              </span>
            )}
            <Link href="/hackathon" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-[15px] font-semibold hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm">
              {t("hackathonGuide.hackathonOverview")}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <GuideNav sections={sections} />

          <div className="mx-auto w-full min-w-0 max-w-4xl space-y-4 sm:space-y-6">
            <section id="overview" className="scroll-mt-20 sm:scroll-mt-24">
              <h2 className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">{t("hackathonGuide.overviewTitle")}</h2>
              <p className="mt-1 text-[15px] leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">{t("hackathonGuide.overviewDesc")}</p>
              <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                {overviewCards.map((c) => (
                  <div key={c.key} className="rounded-[16px] border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg sm:text-xl" aria-hidden>{c.icon}</span>
                      <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white dark:bg-white dark:text-zinc-900 sm:px-2 sm:py-0.5 sm:text-[10px]">{t("hackathonGuide.officialRule")}</span>
                    </div>
                    <h3 className="mt-2.5 text-[13px] font-semibold leading-4 text-zinc-900 dark:text-zinc-100 sm:mt-3 sm:text-sm">{t(`hackathonGuide.cards.${c.key}.title`)}</h3>
                    <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400 sm:leading-5">{t(`hackathonGuide.cards.${c.key}.desc`)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="rules" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:scroll-mt-24 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.rulesTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.rulesDesc")}</p>
              <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.teamRules")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.teamRulesItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">{t("hackathonGuide.laptopRuleTitle")}</h3>
                  <p className="mt-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">{t("hackathonGuide.laptopRuleNote")}</p>
                  <p className="mt-2 text-xs text-indigo-700/80 dark:text-indigo-300/80">{t("hackathonGuide.laptopRuleOther")}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-indigo-800 dark:text-indigo-200">
                    {(t("hackathonGuide.laptopRuleItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.projectRules")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.projectRulesItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.aiRules")}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.aiRulesAllowed")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.aiRulesItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">{t("hackathonGuide.prohibitedTitle")}</h3>
                <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">{t("hackathonGuide.prohibitedDesc")}</p>
              </div>
            </section>

            <section id="how-it-works" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.howItWorksTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.howItWorksDesc")}</p>
              <ol className="mt-4 space-y-3 border-l border-zinc-200 pl-5 sm:mt-5 sm:space-y-4 sm:pl-6 dark:border-zinc-800">
                {howSteps.map((s) => (
                  <li key={s.n} className="relative">
                    <span className="absolute -left-[29px] flex h-3 w-3 items-center justify-center rounded-full bg-zinc-900 ring-4 ring-white dark:bg-white dark:ring-zinc-900" aria-hidden />
                    <div className="flex gap-3">
                      <span className="font-mono text-xs font-bold text-zinc-400">{s.n}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.t}</h3>
                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{s.d}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="ideas" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.ideasTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.ideasDesc")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {displayCategories.map((c) => (
                  <span key={c} className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {categoryLabel(locale, c)}
                  </span>
                ))}
              </div>
              <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">💡 {t("hackathonGuide.ideasNote")}</p>
              <p className="mt-2 text-xs text-zinc-400">{t("hackathonGuide.ideasConfigured").replace("{count}", String(displayCategories.length))}</p>
            </section>

            <section id="preparation" className="scroll-mt-20 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-7">
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">{t("hackathonGuide.prepareTitle")}</h2>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/80">{t("hackathonGuide.prepareDesc")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/30 dark:bg-zinc-900">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.learnProgramming")}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.learnProgrammingNote")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.learnProgrammingItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/30 dark:bg-zinc-900">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.learnUiUx")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.learnUiUxItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/30 dark:bg-zinc-900">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.learnGit")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.learnGitItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/30 dark:bg-zinc-900">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.learnDb")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.learnDbItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <section id="youtube" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.youtubeTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.youtubeDesc")}</p>
              <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t("hackathonGuide.youtubeBeginner")}</h3>
                  <div className="mt-2 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.programmingBasics")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("htmlCss"), yt("js"), yt("progFundamentals")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.git")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("gitBeginners"), yt("githubCrash"), yt("gitCommands")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.webDev")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("howWebsitesWork"), yt("frontendBackend"), yt("howApisWork")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t("hackathonGuide.youtubeIntermediate")}</h3>
                  <div className="mt-2 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.react")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("reactFull"), yt("reactHooks"), yt("reactScratch")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.nextjs")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("nextAppRouter"), yt("nextFull"), yt("nextFullStack")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("hackathonGuide.youtubeGroups.postgresApis")}</p>
                      <ul className="mt-1 space-y-1">
                        {[yt("pgBeginners"), yt("sqlBasics"), yt("pgCrud"), yt("restApi"), yt("buildConsumeApis"), yt("httpMethods")].map((x) => (
                          <li key={x} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="ai" className="scroll-mt-20 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 sm:p-7">
              <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{t("hackathonGuide.aiTitle")}</h2>
              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300/80">{t("hackathonGuide.aiDesc")}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-indigo-800 dark:text-indigo-200">
                {(t("hackathonGuide.aiItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
              </ul>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">⚠️ {t("hackathonGuide.aiWarning")}</div>
            </section>

            <section id="team-prep" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.teamPrepTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.teamPrepDesc")}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {(t("hackathonGuide.teamPrepItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
              </ul>
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{t("hackathonGuide.teamPrepWarning")}</div>
            </section>

            <section id="roles" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.rolesTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.rolesDesc")}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.rolesLeader")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.rolesLeaderItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.rolesResearch")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.rolesResearchItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.rolesDesign")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {(t("hackathonGuide.rolesDesignItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <section id="bring" className="scroll-mt-20 grid gap-3 sm:gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.bringTitle")}</h2>
                <ul className="mt-3 space-y-2 text-[15px] leading-5 text-zinc-600 dark:text-zinc-400 sm:text-sm">
                  {(t("hackathonGuide.bringItems") as unknown as string[]).map((x) => (
                    <li key={x} className="flex gap-2"><span className="text-green-600 dark:text-green-400">✓</span><span>{x}</span></li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{t("hackathonGuide.bringNote")}</p>
              </div>
              <div id="not-bring" className="scroll-mt-20 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 sm:p-7">
                <h2 className="text-lg font-bold text-red-900 dark:text-red-200">{t("hackathonGuide.notBringTitle")}</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-red-800 dark:text-red-300">
                  {(t("hackathonGuide.notBringItems") as unknown as string[]).map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            </section>

            <section id="docs" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.docsTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.docsDesc")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {docsItems.map((it) => (
                  <div key={it.k} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{it.k}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{it.d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-400">{t("final.docsNote")}</p>
            </section>

            <section id="judging" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.judgingTitle")}</h2>
              <p className="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.judgingDesc")}</p>
              <div className="mt-4 grid gap-2">
                {JUDGING_CRITERIA.map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 text-sm dark:bg-zinc-800/60">
                    <span className="text-zinc-700 dark:text-zinc-200">{t(`judging.${c.label}`)}</span>
                    <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">{c.weight}%</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
                  <span>{t("hackathonGuide.total")}</span>
                  <span>100%</span>
                </div>
              </div>
            </section>

            <section id="mindset" className="scroll-mt-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.mindsetTitle")}</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {mindsetItems.map((x) => <li key={x}>{x}</li>)}
              </ol>
            </section>

            <section id="faq" className="scroll-mt-20 sm:scroll-mt-24">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t("hackathonGuide.faqTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("hackathonGuide.faqDesc")}</p>
              <div className="mt-3 sm:mt-4">
                <FAQAccordion items={faqItems} />
              </div>
            </section>

            <section id="checklist" className="scroll-mt-20 sm:scroll-mt-24">
              <ChecklistCard items={checklistItems} />
              <div className="mt-4 flex flex-col gap-2.5 sm:gap-3 sm:flex-row" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                <Link href="/hackathon" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                  {t("hackathonGuide.backToHackathon")}
                </Link>
                {status === "OPEN" ? (
                  <Link href="/hackathon/register" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97]">
                    {t("hackathonGuide.readyCta")}
                  </Link>
                ) : (
                  <Link href="/hackathon/status" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                    {t("hackathonGuide.checkTeamStatus")} →
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
