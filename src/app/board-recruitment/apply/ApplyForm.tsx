"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardApplicationSchema } from "@/lib/validation";
import { submitBoardApplication } from "@/actions/board";
import { Input, Textarea, Select, Label, Button, Card } from "@/components/ui";
import { TIME_COMMITMENTS } from "@/lib/constants";

type Position = { id:string; name:string };

const STEP_LABELS = ["Personal","Position","Experience","Motivation","Confirm"];

export default function ApplyForm({ positions }: { positions: Position[] }) {
  const [step,setStep]=useState(1);
  const [done,setDone]=useState<string|null>(null);
  const [err,setErr]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, trigger, getValues, formState:{errors} } = useForm({
    resolver: zodResolver(boardApplicationSchema),
    defaultValues: { confirm: undefined } as never,
    mode: "onBlur",
  });

  useEffect(()=>{ topRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }); },[step]);

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
      <p className="mt-1 break-all font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{done}</p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Save this ID to check your status later.</p>
    </Card>
  );

  const errText = (k: string) => {
    const v = (errors as Record<string,{message?:string}>)[k];
    return v?.message ? <p className="mt-1.5 text-xs font-medium leading-none text-red-600 dark:text-red-400" role="alert">{String(v.message)}</p> : null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" noValidate>
      <div ref={topRef} className="scroll-mt-20">
        <div className="flex gap-1.5 sm:gap-2" aria-hidden>
          {[1,2,3,4,5].map(n=>(
            <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ease-out sm:h-2 ${n<=step?"bg-zinc-900":"bg-zinc-200 dark:bg-zinc-800"}`} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">STEP {step} OF 5 · <span className="text-zinc-900 dark:text-zinc-100">{STEP_LABELS[step-1]}</span></p>
          <p className="hidden text-xs text-zinc-400 sm:block">{step<5 ? "All * fields required" : "Review and submit"}</p>
        </div>
        <div className="mt-2 flex gap-1.5 sm:hidden" aria-label="Steps">
          {STEP_LABELS.map((l,i)=>(
            <span key={l} className={`flex-1 rounded-full px-1 py-1 text-center text-[10px] font-bold leading-none tracking-wide ${i+1===step?"bg-zinc-900 text-white": i+1<step ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300":"bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>{l}</span>
          ))}
        </div>
      </div>

      {step===1 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 md:col-span-1"><Label htmlFor="fullName">Full name *</Label><Input id="fullName" autoComplete="name" enterKeyHint="next" autoCapitalize="words" {...register("fullName")} />{errText("fullName")}</div>
            <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" {...register("email")} />{errText("email")}</div>
            <div><Label htmlFor="phone">Phone *</Label><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="98XXXXXXXX" {...register("phone")} />{errText("phone")}</div>
            <div><Label htmlFor="grade">Grade/Class *</Label><Input id="grade" autoComplete="off" enterKeyHint="next" placeholder="e.g. 11" {...register("grade")} />{errText("grade")}</div>
            <div><Label htmlFor="section">Section *</Label><Input id="section" enterKeyHint="next" placeholder="e.g. A" {...register("section")} />{errText("section")}</div>
            <div><Label htmlFor="studentId">Student ID <span className="font-normal text-zinc-400">— optional</span></Label><Input id="studentId" inputMode="numeric" autoComplete="off" enterKeyHint="next" placeholder="Optional" {...register("studentId")} />{errText("studentId")}</div>
            <div><Label htmlFor="dateOfBirth">Date of birth <span className="font-normal text-zinc-400">— optional</span></Label><Input id="dateOfBirth" type="date" autoComplete="bday" {...register("dateOfBirth")} /></div>
            <div><Label htmlFor="profilePhoto">Profile photo URL <span className="font-normal text-zinc-400">— optional</span></Label><Input id="profilePhoto" type="url" inputMode="url" autoComplete="url" enterKeyHint="next" placeholder="https://..." {...register("profilePhoto")} /></div>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>next(["fullName","email","phone","grade","section"])} className="w-full sm:w-auto">Next →</Button>
          </div>
        </Card>
      )}

      {step===2 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">Position & Interests</h3>
          <div><Label htmlFor="firstChoicePositionId">Position *</Label>
            <Select id="firstChoicePositionId" {...register("firstChoicePositionId")}><option value="">Select a position — {positions.length} available</option>{positions.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            {errText("firstChoicePositionId")}
            {positions.length===0 && <p className="mt-1.5 text-xs text-amber-600">No positions found — try refreshing.</p>}
          </div>
          <div><Label htmlFor="technicalInterests">Technical interests <span className="font-normal text-zinc-400">— optional</span></Label><Input id="technicalInterests" enterKeyHint="next" placeholder="AI, Web Dev, ..." {...register("technicalInterests")} /></div>
          <div><Label htmlFor="expertise">Areas of expertise <span className="font-normal text-zinc-400">— optional</span></Label><Input id="expertise" enterKeyHint="next" placeholder="e.g. Design, Coding" {...register("expertise")} /></div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(1)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">Back</Button><Button type="button" onClick={()=>next(["firstChoicePositionId"])} className="flex-1 sm:flex-none">Next →</Button>
          </div>
        </Card>
      )}

      {step===3 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">Experience <span className="font-normal text-zinc-400">— all optional</span></h3>
          <div><Label htmlFor="experience">Previous club experience</Label><Textarea id="experience" rows={2} enterKeyHint="next" placeholder="Any clubs or roles before..." {...register("experience")} /></div>
          <div><Label htmlFor="leadershipExperience">Leadership experience</Label><Textarea id="leadershipExperience" rows={2} {...register("leadershipExperience")} /></div>
          <div><Label htmlFor="projects">Technical projects</Label><Textarea id="projects" rows={2} placeholder="Links or short description" {...register("projects")} /></div>
          <div><Label htmlFor="competitions">Competitions</Label><Textarea id="competitions" rows={2} {...register("competitions")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="githubUrl">GitHub URL</Label><Input id="githubUrl" type="url" inputMode="url" autoComplete="url" placeholder="https://github.com/..." {...register("githubUrl")} />{errText("githubUrl")}</div>
            <div><Label htmlFor="portfolioUrl">Portfolio URL</Label><Input id="portfolioUrl" type="url" inputMode="url" autoComplete="url" placeholder="https://..." {...register("portfolioUrl")} />{errText("portfolioUrl")}</div>
          </div>
          <div><Label htmlFor="otherLinks">Other links</Label><Input id="otherLinks" type="url" inputMode="url" placeholder="LinkedIn, etc." {...register("otherLinks")} /></div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(2)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">Back</Button><Button type="button" onClick={()=>setStep(4)} className="flex-1 sm:flex-none">Next →</Button>
          </div>
        </Card>
      )}

      {step===4 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">Motivation</h3>
          <div><Label htmlFor="motivation">Why do you want to join? *</Label><Textarea id="motivation" rows={3} {...register("motivation")} />{errText("motivation")}</div>
          <div><Label htmlFor="positionReason">Why this position? *</Label><Textarea id="positionReason" rows={3} {...register("positionReason")} />{errText("positionReason")}</div>
          <div><Label htmlFor="contribution">What can you contribute? *</Label><Textarea id="contribution" rows={3} {...register("contribution")} />{errText("contribution")}</div>
          <div><Label htmlFor="proposedActivities">Activities you would organize? *</Label><Textarea id="proposedActivities" rows={3} {...register("proposedActivities")} />{errText("proposedActivities")}</div>
          <div><Label htmlFor="timeCommitment">Time commitment *</Label>
            <Select id="timeCommitment" {...register("timeCommitment")}><option value="">Select</option>{TIME_COMMITMENTS.map(t=><option key={t} value={t}>{t}</option>)}</Select>
            {errText("timeCommitment")}
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(3)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">Back</Button><Button type="button" onClick={async()=>{const ok=await trigger(["motivation","positionReason","contribution","proposedActivities","timeCommitment"] as never); if(ok) setStep(5);}} className="flex-1 sm:flex-none">Next →</Button>
          </div>
        </Card>
      )}

      {step===5 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">Confirmation</h3>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 sm:p-4 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <p className="break-words"><b className="text-zinc-900 dark:text-zinc-100">Name:</b> {getValues("fullName")} · <b className="text-zinc-900 dark:text-zinc-100">Email:</b> <span className="break-all">{getValues("email")}</span></p>
            <p className="break-words"><b className="text-zinc-900 dark:text-zinc-100">Grade:</b> {getValues("grade")} {getValues("section")}{getValues("studentId") ? <> · <b className="text-zinc-900 dark:text-zinc-100">ID:</b> {getValues("studentId")}</> : null}</p>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm has-[input:checked]:border-zinc-900 has-[input:checked]:bg-zinc-50 sm:p-3.5 dark:border-zinc-700 dark:bg-zinc-800/50">
            <input type="checkbox" {...register("confirm")} className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-300 accent-zinc-900" />
            <span className="leading-5">I confirm that the information provided is accurate. *</span>
          </label>
          {errText("confirm")}
          {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(4)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">Back</Button><Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">{submitting?"Submitting...":"Submit Application"}</Button>
          </div>
        </Card>
      )}
    </form>
  );
}
