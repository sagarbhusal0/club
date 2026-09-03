"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";
import { NoteModal } from "@/components/NoteModal";

type Single = { applicationNumber:string; fullName:string; status:string; adminNotes?: string | null };

function CardRow({ a, onOpen }: { a: Single; onOpen: (a: Single) => void }) {
  return (
    <button type="button" onClick={() => onOpen(a)} className="w-full text-left rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:bg-zinc-800">
      <p className="break-words dark:text-zinc-100"><span className="font-semibold">Name:</span> {a.fullName}</p>
      <p className="break-all dark:text-zinc-100"><span className="font-semibold">Application:</span> {a.applicationNumber}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 dark:text-zinc-100"><span className="font-semibold">Status:</span> <Badge status={a.status} /></p>
      <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">View admin note →</p>
    </button>
  );
}

export default function StatusPage() {
  const [id,setId]=useState(""); const [email,setEmail]=useState("");
  const [single,setSingle]=useState<Single|null>(null);
  const [list,setList]=useState<Single[]|null>(null);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState<Single|null>(null);

  const hasQuery = id.trim() || email.trim();

  async function check() {
    setErr(""); setSingle(null); setList(null); setLoading(true);
    try {
      const p = new URLSearchParams();
      if (id.trim()) p.set("applicationNumber", id.trim());
      if (email.trim()) p.set("email", email.trim());
      const r = await fetch(`/api/board/status?${p.toString()}`);
      const j = await r.json();
      if (!r.ok) setErr(j.error||"Not found");
      else if (j.applications) setList(j.applications as Single[]);
      else setSingle(j as Single);
    } catch { setErr("Something went wrong"); }
    setLoading(false);
  }

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Check Application Status</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter your Application ID <span className="font-medium text-zinc-700 dark:text-zinc-300">or</span> email — either works.</p>
      <Card className="mt-6 space-y-4">
        <div><Label htmlFor="board-app-id">Application ID <span className="font-normal normal-case tracking-normal text-zinc-400">— or leave blank</span></Label><Input id="board-app-id" autoComplete="off" inputMode="text" enterKeyHint="next" value={id} onChange={e=>setId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
        <div><Label htmlFor="board-email">Email <span className="font-normal normal-case tracking-normal text-zinc-400">— or leave blank</span></Label><Input id="board-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <p className="text-xs leading-5 text-zinc-400">Tap any result to see the admin note.</p>
        <Button onClick={check} disabled={loading || !hasQuery} className="w-full sm:w-auto">{loading?"Checking...":"Check Status"}</Button>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
        {single && <div style={{ animation:"scaleIn 220ms var(--ease-out) both" }}><CardRow a={single} onOpen={setModal} /></div>}
        {list && list.length>0 && (
          <div className="grid gap-3" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{list.length} application{list.length>1?"s":""} found for this email</p>
            {list.map((a) => <CardRow key={a.applicationNumber} a={a} onOpen={setModal} />)}
          </div>
        )}
      </Card>
      </div>
      <NoteModal open={!!modal} onClose={() => setModal(null)} title={modal?.fullName || ""} subtitle={modal?.applicationNumber} status={modal?.status || ""} note={modal?.adminNotes ?? null} />
    </div>
  );
}
