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
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Check Application Status</h1>
      <Card className="mt-6 space-y-4">
        <div><Label>Application ID</Label><Input value={id} onChange={e=>setId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
        <div><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <Button onClick={check} disabled={loading}>{loading?"Checking...":"Check Status"}</Button>
        {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
        {res && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/60" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}>
            <p className="dark:text-zinc-100"><span className="font-semibold">Name:</span> {res.fullName}</p>
            <p className="dark:text-zinc-100"><span className="font-semibold">Application:</span> {res.applicationNumber}</p>
            <p className="mt-2 flex items-center gap-2 dark:text-zinc-100"><span className="font-semibold">Status:</span> <Badge status={res.status} /></p>
          </div>
        )}
      </Card>
    </div>
  );
}
