"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardApplicationSchema } from "@/lib/validation";
import { submitBoardApplication } from "@/actions/board";
import { Input, Textarea, Select, Label, Button, Card } from "@/components/ui";
import { TIME_COMMITMENTS } from "@/lib/constants";

type Position = { id:string; name:string };

export default function ApplyForm({ positions }: { positions: Position[] }) {
  const [step,setStep]=useState(1);
  const [done,setDone]=useState<string|null>(null);
  const [err,setErr]=useState("");
  const [submitting,setSubmitting]=useState(false);

  const { register, handleSubmit, trigger, getValues, formState:{errors} } = useForm({
    resolver: zodResolver(boardApplicationSchema),
    defaultValues: { confirm: undefined } as never,
  });

  const next = async (fields: string[]) => {
    const ok = await trigger(fields as never);
    if (ok) setStep(s=>s+1);
  };

  const onSubmit = async (data: Record<string,unknown>) => {
    setErr(""); setSubmitting(true);
    const res = await submitBoardApplication(data, "client");
    setSubmitting(false);
    if ("error" in res && res.error) setErr(res.error);
    else if ("applicationNumber" in res) setDone(res.applicationNumber as string);
  };

  if (done) return (
    <Card className="text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-2xl">🎉</p>
      <h2 className="mt-2 text-xl font-bold">Application Submitted!</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Your application ID:</p>
      <p className="mt-1 font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{done}</p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Save this ID to check your status later.</p>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex gap-2">
        {[1,2,3,4,5].map(n=>(
          <div key={n} className={`h-2 flex-1 rounded-full transition-colors duration-300 ease-out ${n<=step?"bg-indigo-600":"bg-zinc-200 dark:bg-zinc-800"}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Step {step} of 5</p>

      {step===1 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Full name *</Label><Input {...register("fullName")} />{errors.fullName && <p className="text-xs text-red-600">{String(errors.fullName.message)}</p>}</div>
            <div><Label>Email *</Label><Input {...register("email")} />{errors.email && <p className="text-xs text-red-600">{String(errors.email.message)}</p>}</div>
            <div><Label>Phone *</Label><Input {...register("phone")} />{errors.phone && <p className="text-xs text-red-600">{String(errors.phone.message)}</p>}</div>
            <div><Label>Grade/Class *</Label><Input {...register("grade")} />{errors.grade && <p className="text-xs text-red-600">{String(errors.grade.message)}</p>}</div>
            <div><Label>Section *</Label><Input {...register("section")} />{errors.section && <p className="text-xs text-red-600">{String(errors.section.message)}</p>}</div>
            <div><Label>Student ID (optional)</Label><Input {...register("studentId")} placeholder="Optional" />{errors.studentId && <p className="text-xs text-red-600">{String(errors.studentId.message)}</p>}</div>
            <div><Label>Date of birth (optional)</Label><Input type="date" {...register("dateOfBirth")} /></div>
            <div><Label>Profile photo URL (optional)</Label><Input {...register("profilePhoto")} placeholder="https://..." /></div>
          </div>
          <Button type="button" onClick={()=>next(["fullName","email","phone","grade","section"])}>Next →</Button>
        </Card>
      )}

      {step===2 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">Position & Interests</h3>
          <div><Label>Position *</Label>
            <Select {...register("firstChoicePositionId")}><option value="">Select a position — {positions.length} available</option>{positions.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            {errors.firstChoicePositionId && <p className="text-xs text-red-600">{String(errors.firstChoicePositionId.message)}</p>}
            {positions.length===0 && <p className="text-xs text-amber-600">No positions found — try refreshing.</p>}
          </div>
          <div><Label>Technical interests (optional)</Label><Input {...register("technicalInterests")} placeholder="AI, Web Dev, ..." /></div>
          <div><Label>Areas of expertise (optional)</Label><Input {...register("expertise")} /></div>
          <div className="flex gap-2"><Button type="button" onClick={()=>setStep(1)} className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300">Back</Button><Button type="button" onClick={()=>next(["firstChoicePositionId"])}>Next →</Button></div>
        </Card>
      )}

      {step===3 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">Experience</h3>
          <div><Label>Previous club experience (optional)</Label><Textarea rows={2} {...register("experience")} /></div>
          <div><Label>Leadership experience (optional)</Label><Textarea rows={2} {...register("leadershipExperience")} /></div>
          <div><Label>Technical projects (optional)</Label><Textarea rows={2} {...register("projects")} /></div>
          <div><Label>Competitions (optional)</Label><Textarea rows={2} {...register("competitions")} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>GitHub URL (optional)</Label><Input {...register("githubUrl")} placeholder="https://github.com/..." />{errors.githubUrl && <p className="text-xs text-red-600">{String(errors.githubUrl.message)}</p>}</div>
            <div><Label>Portfolio URL (optional)</Label><Input {...register("portfolioUrl")} placeholder="https://..." />{errors.portfolioUrl && <p className="text-xs text-red-600">{String(errors.portfolioUrl.message)}</p>}</div>
          </div>
          <div><Label>Other links (optional)</Label><Input {...register("otherLinks")} /></div>
          <div className="flex gap-2"><Button type="button" onClick={()=>setStep(2)} className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300">Back</Button><Button type="button" onClick={()=>setStep(4)}>Next →</Button></div>
        </Card>
      )}

      {step===4 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">Motivation</h3>
          <div><Label>Why do you want to join? *</Label><Textarea rows={3} {...register("motivation")} />{errors.motivation && <p className="text-xs text-red-600">{String(errors.motivation.message)}</p>}</div>
          <div><Label>Why this position? *</Label><Textarea rows={3} {...register("positionReason")} />{errors.positionReason && <p className="text-xs text-red-600">{String(errors.positionReason.message)}</p>}</div>
          <div><Label>What can you contribute? *</Label><Textarea rows={3} {...register("contribution")} />{errors.contribution && <p className="text-xs text-red-600">{String(errors.contribution.message)}</p>}</div>
          <div><Label>Activities you would organize? *</Label><Textarea rows={3} {...register("proposedActivities")} />{errors.proposedActivities && <p className="text-xs text-red-600">{String(errors.proposedActivities.message)}</p>}</div>
          <div><Label>Time commitment *</Label>
            <Select {...register("timeCommitment")}><option value="">Select</option>{TIME_COMMITMENTS.map(t=><option key={t} value={t}>{t}</option>)}</Select>
            {errors.timeCommitment && <p className="text-xs text-red-600">{String(errors.timeCommitment.message)}</p>}
          </div>
          <div className="flex gap-2"><Button type="button" onClick={()=>setStep(3)} className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300">Back</Button><Button type="button" onClick={async()=>{const ok=await trigger(["motivation","positionReason","contribution","proposedActivities","timeCommitment"] as never); if(ok) setStep(5);}}>Next →</Button></div>
        </Card>
      )}

      {step===5 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">Confirmation</h3>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <p><b>Name:</b> {getValues("fullName")} · <b>Email:</b> {getValues("email")}</p>
            <p><b>Grade:</b> {getValues("grade")} {getValues("section")}{getValues("studentId") ? <> · <b>ID:</b> {getValues("studentId")}</> : null}</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" {...register("confirm")} className="mt-1" />
            I confirm that the information provided is accurate. *
          </label>
          {errors.confirm && <p className="text-xs text-red-600">{String(errors.confirm.message)}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2"><Button type="button" onClick={()=>setStep(4)} className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300">Back</Button><Button type="submit" disabled={submitting}>{submitting?"Submitting...":"Submit Application"}</Button></div>
        </Card>
      )}
    </form>
  );
}
