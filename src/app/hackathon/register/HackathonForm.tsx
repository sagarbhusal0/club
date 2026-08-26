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
    mode: "onBlur",
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
      <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-400">Team ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{done.teamNumber}</span></p>
      <p className="text-sm break-words dark:text-zinc-300">Team: {done.teamName} · Status: REGISTERED</p>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" noValidate>
      <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
        <h3 className="text-[15px] font-bold sm:text-base">Team Information</h3>
        <div><Label htmlFor="teamName">Team name *</Label><Input id="teamName" autoComplete="off" enterKeyHint="next" {...register("teamName")} />{e.teamName && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.teamName.message}</p>}</div>
        <div><Label htmlFor="projectTitle">Project title *</Label><Input id="projectTitle" enterKeyHint="next" {...register("projectTitle")} />{e.projectTitle && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.projectTitle.message}</p>}</div>
        <div><Label htmlFor="category">Category *</Label>
          <Select id="category" {...register("category")}><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</Select>
          {e.category && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.category.message}</p>}
        </div>
        <div><Label htmlFor="description">Description *</Label><Textarea id="description" rows={3} {...register("description")} />{e.description && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.description.message}</p>}</div>
        <div><Label htmlFor="problemStatement">Problem statement <span className="font-normal text-zinc-400">— optional</span></Label><Textarea id="problemStatement" rows={2} {...register("problemStatement")} /></div>
        <div><Label htmlFor="solution">Proposed solution <span className="font-normal text-zinc-400">— optional</span></Label><Textarea id="solution" rows={2} {...register("solution")} /></div>
        <div><Label htmlFor="technologyStack">Technology stack <span className="font-normal text-zinc-400">— optional</span></Label><Input id="technologyStack" enterKeyHint="next" placeholder="Next.js, Python, ..." {...register("technologyStack")} /></div>
      </Card>

      <h3 className="px-1 text-[15px] font-bold tracking-tight sm:text-lg">Team Members — Exactly 4</h3>
      {(errors as never as { members?: { message?: string } }).members && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{(errors as never as { members: { message: string } }).members.message}</p>}
      {[0,1,2,3].map(i=>(
        <Card key={i} className="space-y-3" style={{ animation:`fadeUp 220ms var(--ease-out) ${i*50}ms both` }}>
          <p className="text-sm font-bold">{i===0?"Member 1 — Team Leader":"Member "+(i+1)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Full name *</Label><Input autoComplete="name" enterKeyHint="next" {...register(`members.${i}.fullName` as never)} /></div>
            <div><Label>Email *</Label><Input type="email" inputMode="email" autoComplete="email" enterKeyHint="next" {...register(`members.${i}.email` as never)} /></div>
            <div><Label>Phone *</Label><Input type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="98XXXXXXXX" {...register(`members.${i}.phone` as never)} /></div>
            <div><Label>Grade *</Label><Input autoComplete="off" enterKeyHint="next" {...register(`members.${i}.grade` as never)} /></div>
            <div><Label>Section *</Label><Input enterKeyHint="next" {...register(`members.${i}.section` as never)} /></div>
            <div><Label>Student ID *</Label><Input inputMode="numeric" enterKeyHint="next" {...register(`members.${i}.studentId` as never)} /></div>
            <div><Label>Role *</Label><Select {...register(`members.${i}.role` as never)}>{MEMBER_ROLES.map(r=><option key={r} value={r}>{r}</option>)}</Select></div>
            <div><Label>GitHub URL <span className="font-normal text-zinc-400">— optional</span></Label><Input type="url" inputMode="url" autoComplete="url" placeholder="https://github.com/..." {...register(`members.${i}.githubUrl` as never)} /></div>
          </div>
        </Card>
      ))}
      {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
      <div className="sticky bottom-0 -mx-4 flex border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">{submitting?"Registering...":"Register Team"}</Button>
      </div>
    </form>
  );
}
