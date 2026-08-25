"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";

export default function HackStatusPage() {
  const [teamNumber,setTeamNumber]=useState(""); const [email,setEmail]=useState("");
  const [res,setRes]=useState<Record<string,string>|null>(null); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  async function check(){
    setErr(""); setRes(null); setLoading(true);
    try{
      const r=await fetch(`/api/hackathon/status?teamNumber=${encodeURIComponent(teamNumber)}&email=${encodeURIComponent(email)}`);
      const j=await r.json();
      if(!r.ok) setErr(j.error||"Not found"); else setRes(j);
    }catch{ setErr("Something went wrong"); }
    setLoading(false);
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Check Team Status</h1>
      <Card className="mt-6 space-y-4">
        <div><Label>Team ID</Label><Input value={teamNumber} onChange={e=>setTeamNumber(e.target.value)} placeholder="ICT-HACK-2026-0001" /></div>
        <div><Label>Leader Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="leader@example.com" /></div>
        <Button onClick={check} disabled={loading}>{loading?"Checking...":"Check Status"}</Button>
        {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
        {res && <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/60" style={{ animation:"scaleIn 220ms var(--ease-out) both" }}><p className="dark:text-zinc-100">Team: {res.teamName}</p><p className="dark:text-zinc-100">Project: {res.projectTitle}</p><p className="mt-2 flex items-center gap-2 dark:text-zinc-100">Status: <Badge status={res.status} /></p></div>}
      </Card>
    </div>
  );
}
