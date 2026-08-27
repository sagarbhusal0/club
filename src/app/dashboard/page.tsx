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

  const hasQuery = email.trim() || appId.trim();

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Dashboard</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-zinc-900 antialiased dark:text-zinc-100 sm:text-[28px]">My Applications</h1>
          <p className="mt-2 max-w-[56ch] text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Search by Application / Team ID or email. One lookup surfaces both board applications and hackathon teams.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Lookup</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter either ID or email — or both. Case-insensitive.</p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="dash-q">Application / Team ID</Label><Input id="dash-q" autoComplete="off" inputMode="text" enterKeyHint="next" value={appId} onChange={e=>setAppId(e.target.value)} placeholder="ICT-BOARD-2026-0001" /></div>
              <div><Label htmlFor="dash-email">Email <span className="font-normal normal-case tracking-normal text-zinc-400">— alternative</span></Label><Input id="dash-email" type="email" inputMode="email" autoComplete="email" enterKeyHint="done" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button onClick={lookup} disabled={loading || !hasQuery} className="w-full sm:w-auto">{loading?"Searching…":"Search"}</Button>
              <button type="button" onClick={()=>{setEmail(""); setAppId(""); setData(null); setErr("");}} className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">Clear</button>
            </div>
            {err && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
            {!hasQuery && !data && !err && (
              <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm leading-5 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                Tip: your Application ID was shown after submitting the board form. You can also check <a href="/board-recruitment/status" className="font-semibold text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700">Board Status</a> or <a href="/hackathon/status" className="font-semibold text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700">Hackathon Status</a>.
              </p>
            )}
          </div>
        </Card>

        {data && (
          <div className="mt-8 space-y-8" style={{ animation:"fadeUp 280ms var(--ease-out) both" }}>
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Board Applications <span className="font-normal normal-case tracking-normal text-zinc-400">· {data.applications.length}</span></h2>
                <span className="hidden text-xs text-zinc-400 sm:inline">Newest first</span>
              </div>
              {data.applications.length===0 ? (
                <div className="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-white px-5 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No board applications found</p>
                  <p className="mx-auto mt-1 max-w-[36ch] text-sm leading-5 text-zinc-500 dark:text-zinc-400">Try your registered email — or check the Board Status page with ID + email.</p>
                  <a href="/board-recruitment/status" className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">Open Board Status</a>
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {data.applications.map(a=>(
                    <div key={a.applicationNumber} className="flex flex-col gap-3 rounded-[16px] border border-zinc-200 bg-white p-4 transition-[border-color,box-shadow] duration-200 ease-out hover:border-zinc-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{a.applicationNumber}</p>
                        <p className="mt-0.5 break-words text-sm text-zinc-600 dark:text-zinc-300">{a.fullName} <span className="text-zinc-400">·</span> {a.grade}</p>
                        <p className="mt-1 text-xs text-zinc-400">{new Date(a.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })}</p>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Hackathon Teams <span className="font-normal normal-case tracking-normal text-zinc-400">· {data.teams.length}</span></h2>
              </div>
              {data.teams.length===0 ? (
                <div className="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-white px-5 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No teams found</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Search with the leader email or Team ID.</p>
                </div>
              ) : (
                <div className="mt-3 grid gap-3">
                  {data.teams.map(t=>(
                    <div key={t.teamNumber} className="rounded-[16px] border border-zinc-200 bg-white p-4 transition-[border-color,box-shadow] duration-200 ease-out hover:border-zinc-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-mono text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t.teamNumber} <span className="font-sans font-semibold">— {t.teamName}</span></p>
                          <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-300">{t.projectTitle} <span className="text-zinc-400">·</span> {t.category}</p>
                          <p className="mt-2 break-words text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t.members.map(m=>`${m.fullName} (${m.role})`).join(" · ")}</p>
                        </div>
                        <span className="shrink-0 self-start"><Badge status={t.status} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
