"use client";
import { useState } from "react";
import { updateTeamStatus } from "@/actions/admin";
import { Select, Button, Textarea } from "@/components/ui";
import { HACKATHON_STATUSES } from "@/lib/constants";

export default function TeamStatusUpdate({ id, current, notes }: { id:string; current:string; notes:string|null }) {
  const [status,setStatus]=useState(current);
  const [note,setNote]=useState(notes||"");
  const [notify,setNotify]=useState(true);
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState<{ok:boolean;text:string}|null>(null);
  return (
    <div className="space-y-3">
      <Select value={status} onChange={e=>setStatus(e.target.value)}>{HACKATHON_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</Select>
      <Textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Admin notes..." />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={notify} onChange={e=>setNotify(e.target.checked)} /> Notify all team members via email</label>
      <Button onClick={async()=>{setSaving(true);setMsg(null);const r=await updateTeamStatus(id,status,note,notify) as {error?:string};setSaving(false);setMsg(r.error?{ok:false,text:r.error}:{ok:true,text:"Saved"});}} disabled={saving}>{saving?"Saving...":"Update"}</Button>
      {msg && <p className={"text-xs "+(msg.ok?"text-emerald-600 dark:text-emerald-400":"font-medium text-red-600 dark:text-red-400")} role="alert">{msg.text}</p>}
    </div>
  );
}
