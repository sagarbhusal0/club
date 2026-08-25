"use client";
import { useState } from "react";
import { bulkSendBroadcast } from "@/actions/admin";
import { Input, Label, Button, Card, Textarea, Select } from "@/components/ui";
import { BOARD_STATUSES, HACKATHON_STATUSES } from "@/lib/constants";

export default function BroadcastForm() {
  const [audience,setAudience]=useState<"board"|"hackathon"|"all">("all");
  const [statusFilter,setStatusFilter]=useState("");
  const [subject,setSubject]=useState("");
  const [html,setHtml]=useState("");
  const [sending,setSending]=useState(false);
  const [result,setResult]=useState<string>("");

  async function send() {
    if (!confirm(`Send broadcast to ${audience}${statusFilter?` (status: ${statusFilter})`:""}?`)) return;
    setSending(true); setResult("");
    const res = await bulkSendBroadcast({ audience, statusFilter: statusFilter||undefined, subject, html });
    setSending(false);
    if ("error" in res && res.error) setResult(`Error: ${res.error}`);
    else setResult(`Sent to ${res.sent} recipients${res.failed?` (${res.failed} failed)`:""} out of ${res.total} total.`);
  }

  const statuses = audience==="board" ? BOARD_STATUSES : audience==="hackathon" ? HACKATHON_STATUSES : [...BOARD_STATUSES];

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <Label>Audience</Label>
          <div className="mt-1 flex gap-2">
            {(["board","hackathon","all"] as const).map(a=>(
              <button key={a} onClick={()=>{setAudience(a); setStatusFilter("");}} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] ${audience===a?"bg-indigo-600 text-white border-indigo-600":"bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"}`}>{a==="board"?"Board":a==="hackathon"?"Hackathon":"All"}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Filter by status (optional)</Label>
          <Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map(s=><option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div><Label>Subject *</Label><Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Important update from ICT Club" /></div>
        <div><Label>Message (HTML allowed) *</Label><Textarea rows={6} value={html} onChange={e=>setHtml(e.target.value)} placeholder="<p>Hello everyone...</p>" /></div>
        {result && <p className={`text-sm ${result.startsWith("Error")?"text-red-600 dark:text-red-400":"text-green-600 dark:text-green-400"}`} role="status">{result}</p>}
        <Button onClick={send} disabled={sending || !subject.trim() || !html.trim()}>{sending?"Sending...":"Send Broadcast"}</Button>
      </Card>
    </div>
  );
}
