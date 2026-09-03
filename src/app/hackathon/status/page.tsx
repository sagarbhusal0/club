"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";
import { NoteModal } from "@/components/NoteModal";
import { useT } from "@/components/LocaleProvider";
import { makeT } from "@/lib/i18n";

type Single = { teamName:string; projectTitle:string; status:string; teamNumber:string; adminNotes?: string | null; ideaReviewNotes?: string | null; ideaStatus?: string; isFinalSubmitted?: boolean; finalSubmittedAt?: string | null };

function CardBtn({ a, onOpen, locale }: { a: Single; onOpen: (a: Single) => void; locale: "en" | "ne" }) {
  const t = makeT(locale);
  return (
    <button type="button" onClick={() => onOpen(a)} className="w-full text-left rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:bg-zinc-800">
      <p className="break-words dark:text-zinc-100">{t("status.team")} {a.teamName}</p><p className="break-words dark:text-zinc-100">{t("status.project")} {a.projectTitle}</p><p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{a.teamNumber}</p><p className="mt-2 flex flex-wrap items-center gap-2 dark:text-zinc-100">{t("status.statusLabel")} <Badge status={a.status} locale={locale} /> {a.ideaStatus && <><span className="text-xs text-zinc-400">{t("status.idea")}</span> <Badge status={a.ideaStatus} locale={locale} /></>} {a.isFinalSubmitted && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{t("status.finalLocked")}</span>}</p>
      <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">{t("status.viewDetails")}</p>
    </button>
  );
}

export default function HackStatusPage() {
  const { locale, t } = useT();
  const [teamNumber,setTeamNumber]=useState(""); const [email,setEmail]=useState("");
  const [single,setSingle]=useState<Single|null>(null);
  const [list,setList]=useState<Single[]|null>(null);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState<Single|null>(null);
  const hasQuery = teamNumber.trim() || email.trim();
  async function check(){
    setErr(""); setSingle(null); setList(null); setLoading(true);
    try{
      const p = new URLSearchParams();
      if (teamNumber.trim()) p.set("teamNumber", teamNumber.trim());
      if (email.trim()) p.set("email", email.trim());
      const r=await fetch(`/api/hackathon/status?${p.toString()}`);
      const j=await r.json();
      if(!r.ok) setErr(j.error||t("status.notFound"));
      else if (j.teams) setList(j.teams as Single[]);
      else setSingle(j as Single);
    }catch{ setErr(t("status.somethingWrong")); }
    setLoading(false);
  }
  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("status.checkTeam")}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("status.enterTeamId")} <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("status.or")}</span> {t("status.emailEither")}</p>
      <Card className="mt-6 space-y-4">
        <div><Label htmlFor="team-id">{t("status.teamId")} <span className="font-normal normal-case tracking-normal text-zinc-400">{t("status.orLeaveBlank")}</span></Label><Input id="team-id" autoComplete="off" inputMode="text" enterKeyHint="next" value={teamNumber} onChange={e=>setTeamNumber(e.target.value)} placeholder="ICT-HACK-2026-0001" /></div>
        <div><Label htmlFor="team-email">{t("status.email")} <span className="font-normal normal-case tracking-normal text-zinc-400">{t("status.orLeaveBlank")}</span></Label><Input id="team-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("status.leaderPlaceholder")} /></div>
        <p className="text-xs leading-5 text-zinc-400">{t("status.tapNoteFinal")}</p>
        <Button onClick={check} disabled={loading || !hasQuery} className="w-full sm:w-auto">{loading?t("status.checking"):t("status.checkStatus")}</Button>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
        {single && <div style={{ animation:"scaleIn 220ms var(--ease-out) both" }}><CardBtn a={single} onOpen={setModal} locale={locale} /></div>}
        {list && list.length>0 && (
          <div className="grid gap-3" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{list.length} {t("status.foundForEmail")}</p>
            {list.map(a=> <CardBtn key={a.teamNumber} a={a} onOpen={setModal} locale={locale} />)}
          </div>
        )}
      </Card>
      </div>
      <NoteModal open={!!modal} onClose={() => setModal(null)} title={modal?.teamName || ""} subtitle={modal ? `${modal.teamNumber} · ${modal.projectTitle} · ${t("status.idea")} ${modal.ideaStatus || "—"}${modal.isFinalSubmitted ? ` · ${t("status.finalLocked")}` : ""}` : ""} status={modal?.status || ""} note={modal?.adminNotes ?? modal?.ideaReviewNotes ?? null} />
    </div>
  );
}
