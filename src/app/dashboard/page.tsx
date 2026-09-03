"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";
import { NoteModal } from "@/components/NoteModal";
import { useT } from "@/components/LocaleProvider";
import { statusLabel, roleLabel } from "@/lib/i18n";

export default function DashboardPage() {
  const { locale, t } = useT();
  const [email,setEmail]=useState("");
  const [appId,setAppId]=useState("");
  const [data,setData]=useState<{applications:{applicationNumber:string;fullName:string;status:string;adminNotes:string|null;grade:string;createdAt:string}[];teams:{teamNumber:string;teamName:string;projectTitle:string;category:string;status:string;adminNotes:string|null;members:{fullName:string;role:string}[]}[]} | null>(null);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState<{title:string; subtitle:string; status:string; note:string|null} | null>(null);

  async function lookup(){
    setErr(""); setData(null); setLoading(true);
    const params = new URLSearchParams();
    if (email.trim()) params.set("email", email.trim());
    if (appId.trim()) params.set("q", appId.trim());
    try{
      const r=await fetch(`/api/user/dashboard?${params.toString()}`);
      const j=await r.json();
      if(!r.ok) setErr(j.error||t("dashboard.notFound")); else setData(j);
    }catch{ setErr(t("dashboard.somethingWrong")); }
    setLoading(false);
  }

  const hasQuery = email.trim() || appId.trim();

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">{t("dashboard.title")}</p>
          <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-zinc-900 antialiased dark:text-zinc-100 sm:text-[28px]">{t("dashboard.myApplications")}</h1>
          <p className="mt-2 max-w-[56ch] text-sm font-normal leading-6 text-zinc-500 dark:text-zinc-400">
            {t("dashboard.searchDesc")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-zinc-100 bg-zinc-50/70 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t("dashboard.lookup")}</p>
            <p className="mt-1 text-sm font-normal leading-5 text-zinc-500 dark:text-zinc-400">{t("dashboard.lookupDesc")}</p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="dash-q">{t("dashboard.idLabel")}</Label><Input id="dash-q" autoComplete="off" inputMode="text" enterKeyHint="next" value={appId} onChange={e=>setAppId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
              <div><Label htmlFor="dash-email">{t("dashboard.email")} <span className="font-normal normal-case tracking-normal text-zinc-400">— {t("dashboard.idAlternative")}</span></Label><Input id="dash-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button onClick={lookup} disabled={loading || !hasQuery} className="w-full sm:w-auto">
                {loading ? <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/20 dark:border-t-zinc-900" aria-hidden /> {t("dashboard.searching")}</span> : t("dashboard.search")}
              </Button>
              <button type="button" onClick={()=>{setEmail(""); setAppId(""); setData(null); setErr("");}} className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-700 transition-[border-color,background-color] duration-150 ease-out hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">{t("dashboard.clear")}</button>
            </div>
            {loading && (
              <div className="mt-6 grid gap-3">
                <div className="h-20 rounded-[16px] border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s ease infinite" }} />
                <div className="h-20 rounded-[16px] border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s ease 0.15s infinite" }} />
              </div>
            )}
            {err && <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-normal leading-5 text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert"><span aria-hidden className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">!</span>{err}</p>}
            {!hasQuery && !data && !err && !loading && (
              <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("dashboard.whereId")}</p>
                <p className="mt-1 text-sm font-normal leading-5 text-zinc-500 dark:text-zinc-400">
                  {t("dashboard.shownAfterSubmit")} <a href="/board-recruitment/status" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600">{t("dashboard.boardStatus")}</a> or <a href="/hackathon/status" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600">{t("dashboard.hackathonStatus")}</a> with ID + email.
                </p>
              </div>
            )}
          </div>
        </Card>

        {data && (
          <div className="mt-8 space-y-8" style={{ animation:"fadeUp 280ms var(--ease-out) both" }}>
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">{t("dashboard.boardApplications")} <span className="font-normal normal-case tracking-normal text-zinc-400">· {data.applications.length}</span></h2>
                <span className="hidden text-xs font-normal text-zinc-400 sm:inline">{t("dashboard.newestFirst")}</span>
              </div>
              {data.applications.length===0 ? (
                <div className="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-white px-5 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("dashboard.noBoardApps")}</p>
                  <p className="mx-auto mt-1 max-w-[36ch] text-sm font-normal leading-5 text-zinc-500 dark:text-zinc-400">{t("dashboard.tryEmail")}</p>
                  <a href="/board-recruitment/status" className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">{t("dashboard.openBoardStatus")}</a>
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {data.applications.map(a=>(
                    <button key={a.applicationNumber} type="button" onClick={() => setModal({ title: a.fullName, subtitle: a.applicationNumber, status: a.status, note: a.adminNotes })} className="group w-full text-left rounded-[16px] border border-zinc-200 bg-white p-4 transition-[border-color,box-shadow,transform] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-all font-mono text-[13px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">{a.applicationNumber}</p>
                          <p className="mt-0.5 break-words text-sm font-normal text-zinc-600 dark:text-zinc-300">{a.fullName} <span className="text-zinc-300 dark:text-zinc-600">·</span> {a.grade}</p>
                          <p className="mt-1 text-xs font-normal text-zinc-400">{new Date(a.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })}</p>
                        </div>
                        <Badge status={a.status} locale={locale} />
                      </div>
                      <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">{t("dashboard.viewNote")}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">{t("dashboard.hackathonTeams")} <span className="font-normal normal-case tracking-normal text-zinc-400">· {data.teams.length}</span></h2>
              {data.teams.length===0 ? (
                <div className="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-white px-5 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("dashboard.noTeams")}</p>
                  <p className="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">{t("dashboard.tryLeaderEmail")}</p>
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {data.teams.map(team=>(
                    <button key={team.teamNumber} type="button" onClick={() => setModal({ title: `${team.teamName} — ${team.projectTitle}`, subtitle: team.teamNumber, status: team.status, note: team.adminNotes })} className="group w-full text-left rounded-[16px] border border-zinc-200 bg-white p-4 transition-[border-color,box-shadow,transform] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-mono text-[13px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">{team.teamNumber} <span className="font-sans font-medium">— {team.teamName}</span></p>
                          <p className="mt-1 break-words text-sm font-normal text-zinc-600 dark:text-zinc-300">{team.projectTitle} <span className="text-zinc-300 dark:text-zinc-600">·</span> {team.category}</p>
                          <p className="mt-2 break-words text-xs font-normal leading-5 text-zinc-500 dark:text-zinc-400">{team.members.map(m=>`${m.fullName} (${roleLabel(locale, m.role)})`).join(" · ")}</p>
                        </div>
                        <span className="shrink-0 self-start"><Badge status={team.status} locale={locale} /></span>
                      </div>
                      <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">{t("dashboard.viewNote")}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <NoteModal open={!!modal} onClose={() => setModal(null)} title={modal?.title || ""} subtitle={modal?.subtitle} status={modal?.status || ""} note={modal?.note ?? null} />
    </div>
  );
}
