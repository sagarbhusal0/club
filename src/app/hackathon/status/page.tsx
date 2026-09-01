"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";
import { NoteModal } from "@/components/NoteModal";

type Single = { teamName:string; projectTitle:string; status:string; teamNumber:string; adminNotes?: string | null; ideaStatus?: string; isFinalSubmitted?: boolean; finalSubmittedAt?: string | null };

export default function HackStatusPage() {
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
      if(!r.ok) setErr(j.error||"Not found");
      else if (j.teams) setList(j.teams as Single[]);
      else setSingle(j as Single);
    }catch{ setErr("Something went wrong"); }
    setLoading(false);
  }
  function CardBtn({ a }: { a: Single }) {
    return (
      <button type="button" onClick={() => setModal(a)} className="w-full text-left rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:bg-zinc-800">
        <p className="break-words dark:text-zinc-100">Team: {a.teamName}</p><p className="break-words dark:text-zinc-100">Project: {a.projectTitle}</p><p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">{a.teamNumber}</p><p className="mt-2 flex flex-wrap items-center gap-2 dark:text-zinc-100">Status: <Badge status={a.status} /> {a.ideaStatus && <><span className="text-xs text-zinc-400">Idea:</span> <Badge status={a.ideaStatus} /></>} {a.isFinalSubmitted && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">Final locked</span>}</p>
        <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">View details →</p>
      </button>
    );
  }
  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Check Team Status</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter your Team ID <span className="font-medium text-zinc-700 dark:text-zinc-300">or</span> email — either works.</p>
      <Card className="mt-6 space-y-4">
        <div><Label htmlFor="team-id">Team ID <span className="font-normal normal-case tracking-normal text-zinc-400">— or leave blank</span></Label><Input id="team-id" autoComplete="off" inputMode="text" enterKeyHint="next" value={teamNumber} onChange={e=>setTeamNumber(e.target.value)} placeholder="ICT-HACK-2026-0001" /></div>
        <div><Label htmlFor="team-email">Email <span className="font-normal normal-case tracking-normal text-zinc-400">— or leave blank</span></Label><Input id="team-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="leader@example.com" /></div>
        <p className="text-xs leading-5 text-zinc-400">Tap any result to see admin notes &amp; final submission status.</p>
        <Button onClick={check} disabled={loading || !hasQuery} className="w-full sm:w-auto">{loading?"Checking...":"Check Status"}</Button>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
        {single && <div style={{ animation:"scaleIn 220ms var(--ease-out) both" }}><CardBtn a={single} /></div>}
        {list && list.length>0 && (
          <div className="grid gap-3" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{list.length} team{list.length>1?"s":""} found for this email</p>
            {list.map(a=> <CardBtn key={a.teamNumber} a={a} />)}
          </div>
        )}
      </Card>
      </div>
      <NoteModal open={!!modal} onClose={() => setModal(null)} title={modal?.teamName || ""} subtitle={modal ? `${modal.teamNumber} · ${modal.projectTitle} · Idea: ${modal.ideaStatus || "—"}${modal.isFinalSubmitted ? " · Final locked" : ""}` : ""} status={modal?.status || ""} note={modal?.adminNotes ?? null} />
    </div>
  );
}
