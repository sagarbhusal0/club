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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Search by Application/Team ID or email to see your board applications and hackathon teams.</p>

      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Application / Team ID</Label><Input value={appId} onChange={e=>setAppId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
          <div><Label>Email (alternative)</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={lookup} disabled={loading || (!email.trim() && !appId.trim())}>{loading?"Searching...":"Search"}</Button>
          <Button onClick={()=>{setEmail(""); setAppId(""); setData(null); setErr("");}} className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100">Clear</Button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Enter either your Application/Team ID (e.g. ICT-BOARD-2026-0001) or your email — or both.</p>
        {err && <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
      </Card>

      {data && (
        <div className="mt-6 space-y-6" style={{ animation:"fadeUp 300ms var(--ease-out) both" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Board Applications ({data.applications.length})</h2>
            {data.applications.length===0 ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No board applications found.</p>
            : <div className="mt-3 grid gap-3">
              {data.applications.map(a=>(
                <Card key={a.applicationNumber} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold">{a.applicationNumber}</p>
                    <p className="text-sm dark:text-zinc-200">{a.fullName} · {a.grade}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge status={a.status} />
                </Card>
              ))}
              </div>}
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">Hackathon Teams ({data.teams.length})</h2>
            {data.teams.length===0 ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No teams found.</p>
            : <div className="mt-3 grid gap-3">
              {data.teams.map(t=>(
                <Card key={t.teamNumber}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold">{t.teamNumber} — {t.teamName}</p>
                      <p className="text-sm dark:text-zinc-200">{t.projectTitle} · {t.category}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.members.map(m=>`${m.fullName} (${m.role})`).join(", ")}</p>
                    </div>
                    <Badge status={t.status} />
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
