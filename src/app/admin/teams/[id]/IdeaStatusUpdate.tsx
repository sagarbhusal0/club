"use client";
import { useState } from "react";
import { updateIdeaStatus } from "@/actions/admin";
import { Select, Button, Textarea } from "@/components/ui";
export default function IdeaStatusUpdate({ id, current, notes }: { id:string; current:string; notes:string|null }) {
  const [status,setStatus]=useState(current);
  const [note,setNote]=useState(notes||"");
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  return (<div className="space-y-3"><Select value={status} onChange={e=>setStatus(e.target.value)}>{["PENDING","APPROVED","NEEDS_REVISION","REJECTED"].map(s=><option key={s} value={s}>{s}</option>)}</Select><Textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Admin note - explain why revision is needed..." /><div className="flex items-center gap-3"><Button onClick={async()=>{setSaving(true);setMsg("");const r=await updateIdeaStatus(id,status,note) as {error?:string};setSaving(false);setMsg(r.error||"Saved");}} disabled={saving}>{saving?"Saving...":"Update idea"}</Button>{msg && <span className="text-xs text-zinc-500 dark:text-zinc-400">{msg}</span>}</div></div>);
}
