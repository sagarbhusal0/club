"use client";
import { useState } from "react";
import { Input, Button, Label, Card, Badge } from "@/components/ui";

export default function DashboardPage() {
  const [email,setEmail]=useState("");
  const [appId,setAppId]=useState("");
  const [data,setData]=useState<{applications:{applicationNumber:string;fullName:string;status:string;grade:string;createdAt:string}[];teams:{teamNumber:string;teamName:string;projectTitle:string;category:string;status:string;members:{fullName:string;role:string}[]}[]} | null>(null);
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);

  async function lookup(){
    setErr(""); setData(null); setLoading(true);
    const params = new URLSearchParams();
    if (email.trim()) params.set("email", email.trim());
    if (appId.trim()) params.set("q", appId.trim());
    try{
      const r=await fetch(`/api/user/dashboard?${params.toString()}`);
      const j=await r.json();
      if(!r.ok) setErr(j.error||"Not found"); else setData(j);
    }catch{ setErr("Something went wrong"); }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">My Applications</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Search by Application/Team ID or email to see your board applications and hackathon teams.</p>

      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="dash-q">Application / Team ID</Label><Input id="dash-q" autoComplete="off" inputMode="text" enterKeyHint="next" value={appId} onChange={e=>setAppId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
          <div><Label htmlFor="dash-email">Email <span className="font-normal text-zinc-400">— alternative</span></Label><Input id="dash-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={lookup} disabled={loading || (!email.trim() && !appId.trim())} className="w-full sm:w-auto">{loading?"Searching...":"Search"}</Button>
          <Button onClick={()=>{setEmail(""); setAppId(""); setData(null); setErr("");}} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:w-auto">Clear</Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">Enter either your Application/Team ID (e.g. ICT-BOARD-2026-0001) or your email — or both.</p>
        {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
      </Card>

      {data && (
        <div className="mt-6 space-y-6" style={{ animation:"fadeUp 300ms var(--ease-out) both" }}>
          <div>
            <h2 className="text-base font-bold tracking-tight sm:text-lg">Board Applications ({data.applications.length})</h2>
            {data.applications.length===0 ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No board applications found.</p>
            : <div className="mt-3 grid gap-3">
              {data.applications.map(a=>(
                <Card key={a.applicationNumber} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-bold">{a.applicationNumber}</p>
                    <p className="break-words text-sm dark:text-zinc-200">{a.fullName} · {a.grade}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="self-start sm:self-auto"><Badge status={a.status} /></span>
                </Card>
              ))}
              </div>}
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight sm:text-lg">Hackathon Teams ({data.teams.length})</h2>
            {data.teams.length===0 ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No teams found.</p>
            : <div className="mt-3 grid gap-3">
              {data.teams.map(t=>(
                <Card key={t.teamNumber}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-mono text-sm font-bold">{t.teamNumber} — {t.teamName}</p>
                      <p className="break-words text-sm dark:text-zinc-200">{t.projectTitle} · {t.category}</p>
                      <p className="break-words text-xs text-zinc-500 dark:text-zinc-400">{t.members.map(m=>`${m.fullName} (${m.role})`).join(", ")}</p>
                    </div>
                    <span className="shrink-0 self-start"><Badge status={t.status} /></span>
                  </div>
                </Card>
              ))}
              </div>}
          </div>
        </div>
      )}
    </div>
  );
}
