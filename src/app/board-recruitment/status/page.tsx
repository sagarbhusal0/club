"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";

export default function StatusPage() {
  const [id,setId]=useState(""); const [email,setEmail]=useState("");
  const [res,setRes]=useState<Record<string,string>|null>(null);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);

  async function check() {
    setErr(""); setRes(null); setLoading(true);
    try {
      const r = await fetch(`/api/board/status?applicationNumber=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!r.ok) setErr(j.error||"Not found");
      else setRes(j);
    } catch { setErr("Something went wrong"); }
    setLoading(false);
  }

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Check Application Status</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter your Application ID and email.</p>
      <Card className="mt-6 space-y-4">
        <div><Label htmlFor="board-app-id">Application ID</Label><Input id="board-app-id" autoComplete="off" inputMode="text" enterKeyHint="next" value={id} onChange={e=>setId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
        <div><Label htmlFor="board-email">Email</Label><Input id="board-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <Button onClick={check} disabled={loading} className="w-full sm:w-auto">{loading?"Checking...":"Check Status"}</Button>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
        {res && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/60" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}>
            <p className="break-words dark:text-zinc-100"><span className="font-semibold">Name:</span> {res.fullName}</p>
            <p className="break-all dark:text-zinc-100"><span className="font-semibold">Application:</span> {res.applicationNumber}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 dark:text-zinc-100"><span className="font-semibold">Status:</span> <Badge status={res.status} /></p>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
