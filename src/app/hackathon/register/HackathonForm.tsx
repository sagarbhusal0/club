"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hackathonSchema } from "@/lib/validation";
import { submitHackathonTeam } from "@/actions/hackathon";
import { Input, Textarea, Select, Label, Button, Card } from "@/components/ui";
import { MEMBER_ROLES } from "@/lib/constants";

const emptyMember = { fullName:"", email:"", phone:"", grade:"", section:"", studentId:"", role:"Developer", githubUrl:"" };

export default function HackathonForm({ categories }: { categories: string[] }) {
  const [done,setDone]=useState<{teamNumber:string;teamName:string}|null>(null);
  const [err,setErr]=useState(""); const [submitting,setSubmitting]=useState(false);
  const { register, handleSubmit, formState:{errors} } = useForm({
    resolver: zodResolver(hackathonSchema),
    defaultValues: { members:[ {...emptyMember, role:"Team Leader"}, {...emptyMember}, {...emptyMember}, {...emptyMember}] } as never,
  });

  const onSubmit = async (data: Record<string,unknown>) => {
    setErr(""); setSubmitting(true);
    const res = await submitHackathonTeam(data, "client");
    setSubmitting(false);
    if ("error" in res && res.error) setErr(res.error);
    else if ("teamNumber" in res) setDone(res as never);
  };

  const e = errors as Record<string, { message?: string }>;

  if (done) return (
    <Card className="text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-2xl">🎉</p>
      <h2 className="text-xl font-bold">Registration Successful!</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Team ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{done.teamNumber}</span></p>
      <p className="text-sm dark:text-zinc-300">Team: {done.teamName} · Status: REGISTERED</p>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
        <h3 className="font-bold">Team Information</h3>
        <div><Label>Team name *</Label><Input {...register("teamName")} />{e.teamName && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{e.teamName.message}</p>}</div>
        <div><Label>Project title *</Label><Input {...register("projectTitle")} />{e.projectTitle && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{e.projectTitle.message}</p>}</div>
        <div><Label>Category *</Label>
          <Select {...register("category")}><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</Select>
          {e.category && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{e.category.message}</p>}
        </div>
        <div><Label>Description *</Label><Textarea rows={3} {...register("description")} />{e.description && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{e.description.message}</p>}</div>
        <div><Label>Problem statement</Label><Textarea rows={2} {...register("problemStatement")} /></div>
        <div><Label>Proposed solution</Label><Textarea rows={2} {...register("solution")} /></div>
        <div><Label>Technology stack</Label><Input {...register("technologyStack")} placeholder="Next.js, Python, ..." /></div>
      </Card>

      <h3 className="text-lg font-bold tracking-tight">Team Members — Exactly 4</h3>
      {(errors as never as { members?: { message?: string } }).members && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{(errors as never as { members: { message: string } }).members.message}</p>}
      {[0,1,2,3].map(i=>(
        <Card key={i} className="space-y-3" style={{ animation:`fadeUp 220ms var(--ease-out) ${i*50}ms both` }}>
          <p className="font-semibold text-sm">{i===0?"Member 1 — Team Leader":"Member "+(i+1)}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Full name *</Label><Input {...register(`members.${i}.fullName` as never)} /></div>
            <div><Label>Email *</Label><Input {...register(`members.${i}.email` as never)} /></div>
            <div><Label>Phone *</Label><Input {...register(`members.${i}.phone` as never)} /></div>
            <div><Label>Grade *</Label><Input {...register(`members.${i}.grade` as never)} /></div>
            <div><Label>Section *</Label><Input {...register(`members.${i}.section` as never)} /></div>
            <div><Label>Student ID *</Label><Input {...register(`members.${i}.studentId` as never)} /></div>
            <div><Label>Role *</Label><Select {...register(`members.${i}.role` as never)}>{MEMBER_ROLES.map(r=><option key={r} value={r}>{r}</option>)}</Select></div>
            <div><Label>GitHub URL</Label><Input {...register(`members.${i}.githubUrl` as never)} placeholder="https://github.com/..." /></div>
          </div>
        </Card>
      ))}
      {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
      <Button type="submit" disabled={submitting}>{submitting?"Registering...":"Register Team"}</Button>
    </form>
  );
}
