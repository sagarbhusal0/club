"use client";
import { useState } from "react";
import { updateSettings, togglePosition, upsertPosition, sendTestEmail } from "@/actions/admin";
import { Input, Label, Button, Card, Textarea } from "@/components/ui";

export default function SettingsForm({ initial, positions }: { initial: Record<string,string>; positions: { id:string; name:string; isActive:boolean; description:string|null }[] }) {
  const [saving,setSaving]=useState(false);
  const [testTo,setTestTo]=useState(""); const [testSending,setTestSending]=useState(false); const [testResult,setTestResult]=useState("");
  const [newPos,setNewPos]=useState(""); const [newDesc,setNewDesc]=useState("");

  async function save(formData: FormData) {
    setSaving(true);
    const data: Record<string,string> = {};
    for (const [k,v] of formData.entries()) data[k]=String(v);
    await updateSettings(data);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-bold">General</h3>
        <form action={save} className="mt-4 space-y-3">
          <div><Label>Club name</Label><Input name="club_name" defaultValue={initial.club_name||""} /></div>
          <div><Label>Club description</Label><Input name="club_description" defaultValue={initial.club_description||""} /></div>
          <div><Label>Contact email</Label><Input name="contact_email" defaultValue={initial.contact_email||""} /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Board opens</Label><Input type="date" name="board_opens" defaultValue={initial.board_opens||""} /></div>
            <div><Label>Board closes</Label><Input type="date" name="board_closes" defaultValue={initial.board_closes||""} /></div>
            <div><Label>Hackathon opens</Label><Input type="date" name="hackathon_opens" defaultValue={initial.hackathon_opens||""} /></div>
            <div><Label>Hackathon closes</Label><Input type="date" name="hackathon_closes" defaultValue={initial.hackathon_closes||""} /></div>
            <div><Label>Hackathon date</Label><Input type="date" name="hackathon_date" defaultValue={initial.hackathon_date||""} /></div>
            <div><Label>Hackathon categories (comma separated)</Label><Input name="hackathon_categories" defaultValue={initial.hackathon_categories||""} /></div>
          </div>
          <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Settings"}</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold">Email</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Sender: ict@sorvx.com via Brevo SMTP. Configure SMTP_HOST/USER/PASS in .env. In mock mode (no SMTP_PASS) emails log to console.</p>
        <div className="mt-3 flex gap-2">
          <Input value={testTo} onChange={e=>setTestTo(e.target.value)} placeholder="Test recipient email" />
          <Button onClick={async()=>{ setTestSending(true); setTestResult(""); const r=await sendTestEmail(testTo); setTestSending(false); setTestResult("error" in r && r.error ? `Error: ${r.error}` : "Test email sent!"); }} disabled={testSending || !testTo.includes("@")}>{testSending?"Sending...":"Send Test"}</Button>
        </div>
        {testResult && <p className={`mt-2 text-sm ${testResult.startsWith("Error")?"text-red-600 dark:text-red-400":"text-green-600 dark:text-green-400"}`} role="status">{testResult}</p>}
      </Card>

      <Card>
        <h3 className="font-bold">Board Positions</h3>
        <div className="mt-3 space-y-2">
          {positions.map(p=>(
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
              <span className={p.isActive?"":"opacity-50 line-through"}>{p.name}</span>
              <Button onClick={async()=>{ await togglePosition(p.id, !p.isActive); location.reload(); }} className={`px-3 py-1 text-xs ${p.isActive?"bg-zinc-200 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300":"bg-green-600"}`}>
                {p.isActive?"Disable":"Enable"}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={newPos} onChange={e=>setNewPos(e.target.value)} placeholder="New position name" />
          <Input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description" />
          <Button onClick={async()=>{ if(!newPos.trim()) return; await upsertPosition(newPos, newDesc); location.reload(); }}>Add</Button>
        </div>
      </Card>
    </div>
  );
}
