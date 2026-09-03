"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { finalSubmissionSchema } from "@/lib/validation";
import { submitFinal } from "@/actions/hackathon";
import { Input, Textarea, Label, Button, Card } from "@/components/ui";

export default function FinalPage() {
  const [teamNumber,setTeamNumber]=useState("");
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const { register, handleSubmit, formState:{errors} } = useForm({
    resolver: zodResolver(finalSubmissionSchema),
    defaultValues: { repositoryUrl:"", documentationUrl:"", finalDemoUrl:"", finalDescription:"", aiToolsUsed:"", originalWorkConfirmed: false as unknown as true },
  });
  const e = errors as Record<string,{message?:string}>;
  async function onSubmit(data: Record<string,unknown>){
    setErr("");
    if(!teamNumber.trim()){ setErr("Team ID required"); return; }
    const res = await submitFinal(teamNumber, data, "client");
    if("error" in res && res.error) setErr(res.error);
    else setDone(true);
  }
  if(done) return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <p className="text-3xl">✅</p><h1 className="mt-2 text-xl font-bold">Final Submission Locked</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your submission is saved. Contact an admin if you need changes.</p>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Final Submission</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Submit your repository, documentation, and demo. Requires original-work confirmation — submission locks on success.</p>
      <Card className="mt-6 space-y-4">
        <div><Label htmlFor="teamNumber">Team ID *</Label><Input id="teamNumber" value={teamNumber} onChange={e=>setTeamNumber(e.target.value)} placeholder="ICT-HACK-2026-0001" /></div>
        <div><Label htmlFor="repositoryUrl">Repository URL *</Label><Input id="repositoryUrl" type="url" placeholder="https://github.com/..." {...register("repositoryUrl")} />{e.repositoryUrl && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.repositoryUrl.message}</p>}</div>
        <div><Label htmlFor="documentationUrl">Documentation URL *</Label><Input id="documentationUrl" type="url" placeholder="https://..." {...register("documentationUrl")} />{e.documentationUrl && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.documentationUrl.message}</p>}<p className="mt-1 text-xs text-zinc-400">Must cover: Team, Project, Members, Problem, Target Users, Solution, Features, Tech Stack, How It Works, Screenshots/Demo, Challenges, Future Improvements.</p></div>
        <div><Label htmlFor="finalDemoUrl">Demo URL <span className="font-normal text-zinc-400">— optional</span></Label><Input id="finalDemoUrl" type="url" placeholder="https://..." {...register("finalDemoUrl")} /></div>
        <div><Label htmlFor="finalDescription">Final project description <span className="font-normal text-zinc-400">— optional</span></Label><Textarea id="finalDescription" rows={3} {...register("finalDescription" as never)} /></div>
        <div><Label htmlFor="aiToolsUsed">AI tools used <span className="font-normal text-zinc-400">— optional</span></Label><Input id="aiToolsUsed" placeholder="ChatGPT, Copilot, ..." {...register("aiToolsUsed" as never)} /></div>
        <label className="flex gap-3 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"><input type="checkbox" {...register("originalWorkConfirmed" as never)} className="mt-0.5" /><span>I confirm this is original work created during the hackathon.</span></label>
        { (e as never as { originalWorkConfirmed?: { message:string } }).originalWorkConfirmed && <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">{(e as never as { originalWorkConfirmed:{message:string}}).originalWorkConfirmed.message}</p>}
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{err}</p>}
        <Button onClick={handleSubmit(onSubmit as never)} className="w-full sm:w-auto">Submit Final</Button>
      </Card>
    </div>
  );
}
