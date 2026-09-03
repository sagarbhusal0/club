"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildBoardApplicationSchema } from "@/lib/validation";
import { submitBoardApplication } from "@/actions/board";
import { Input, Textarea, Select, Label, Button, Card } from "@/components/ui";
import { TIME_COMMITMENTS } from "@/lib/constants";
import { useT, getDict } from "@/components/LocaleProvider";

type Position = { id:string; name:string };

export default function ApplyForm({ positions }: { positions: Position[] }) {
  const { locale, t } = useT();
  const dict = getDict(locale);
  const STEP_LABELS = dict.apply.steps;
  const [step,setStep]=useState(1);
  const [done,setDone]=useState<string|null>(null);
  const [err,setErr]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, trigger, getValues, formState:{errors} } = useForm({
    resolver: zodResolver(buildBoardApplicationSchema(dict.validation)),
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
    const res = await submitBoardApplication(data, "client", locale);
    setSubmitting(false);
    if ("error" in res && res.error) setErr(res.error);
    else if ("applicationNumber" in res) setDone(res.applicationNumber as string);
  };

  if (done) return (
    <Card className="text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-2xl">🎉</p>
      <h2 className="mt-2 text-xl font-bold">{t("apply.submitted")}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("apply.yourId")}</p>
      <p className="mt-1 break-all font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{done}</p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("apply.saveId")}</p>
    </Card>
  );

  const errText = (k: string) => {
    const v = (errors as Record<string,{message?:string}>)[k];
    return v?.message ? <p className="mt-2 flex items-start gap-1.5 text-xs font-normal leading-5 text-red-600 dark:text-red-400" role="alert"><span aria-hidden className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">!</span>{String(v.message)}</p> : null;
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
          <p className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{t("apply.step")} {step} {t("apply.of")} · <span className="text-zinc-900 dark:text-zinc-100">{STEP_LABELS[step-1]}</span></p>
          <p className="hidden text-xs text-zinc-400 sm:block">{step<5 ? t("apply.allFieldsRequired") : t("apply.reviewAndSubmit")}</p>
        </div>
        <div className="mt-2 flex gap-1.5 sm:hidden" aria-label={t("apply.stepsLabel")}>
          {STEP_LABELS.map((l,i)=>(
            <span key={l} className={`flex-1 rounded-full px-1 py-1 text-center text-[10px] font-bold leading-none tracking-wide ${i+1===step?"bg-zinc-900 text-white": i+1<step ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300":"bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>{l}</span>
          ))}
        </div>
      </div>

      {step===1 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("apply.personalInfo")}</h3>
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium leading-5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">{t("apply.englishOnly")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 md:col-span-1"><Label htmlFor="fullName">{t("apply.fullName")} *</Label><Input id="fullName" autoComplete="name" enterKeyHint="next" autoCapitalize="words" {...register("fullName")} />{errText("fullName")}</div>
            <div><Label htmlFor="email">{t("apply.email")} *</Label><Input id="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" {...register("email")} />{errText("email")}</div>
            <div><Label htmlFor="phone">{t("apply.phone")} *</Label><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="98XXXXXXXX" {...register("phone")} />{errText("phone")}</div>
            <div><Label htmlFor="grade">{t("apply.grade")} *</Label><Input id="grade" autoComplete="off" enterKeyHint="next" placeholder="e.g. 11" {...register("grade")} />{errText("grade")}</div>
            <div><Label htmlFor="section">{t("apply.section")} *</Label><Input id="section" enterKeyHint="next" placeholder="e.g. A" {...register("section")} />{errText("section")}</div>
            <div><Label htmlFor="studentId">{t("apply.studentId")} <span className="font-normal text-zinc-400">{t("apply.optional")}</span></Label><Input id="studentId" inputMode="numeric" autoComplete="off" enterKeyHint="next" placeholder="—" {...register("studentId")} />{errText("studentId")}</div>
            <div><Label htmlFor="dateOfBirth">{t("apply.dateOfBirth")} <span className="font-normal text-zinc-400">{t("apply.optional")}</span></Label><Input id="dateOfBirth" type="date" autoComplete="bday" {...register("dateOfBirth")} /></div>
            <div><Label htmlFor="profilePhoto">{t("apply.profilePhotoUrl")} <span className="font-normal text-zinc-400">{t("apply.optional")}</span></Label><Input id="profilePhoto" type="url" inputMode="url" autoComplete="url" enterKeyHint="next" placeholder="https://..." {...register("profilePhoto")} /></div>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>next(["fullName","email","phone","grade","section"])} className="w-full sm:w-auto">{t("apply.next")}</Button>
          </div>
        </Card>
      )}

      {step===2 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("apply.positionInterests")}</h3>
          <div><Label htmlFor="firstChoicePositionId">{t("apply.position")} *</Label>
            <Select id="firstChoicePositionId" {...register("firstChoicePositionId")}><option value="">{t("apply.selectPosition")} — {positions.length} {t("apply.available")}</option>{positions.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            {errText("firstChoicePositionId")}
            {positions.length===0 && <p className="mt-1.5 text-xs text-amber-600">{t("apply.noPositions")}</p>}
          </div>
          <div><Label htmlFor="technicalInterests">{t("apply.technicalInterests")} <span className="font-normal text-zinc-400">{t("apply.optional")}</span></Label><Input id="technicalInterests" enterKeyHint="next" placeholder="AI, Web Dev, ..." {...register("technicalInterests")} /></div>
          <div><Label htmlFor="expertise">{t("apply.expertise")} <span className="font-normal text-zinc-400">{t("apply.optional")}</span></Label><Input id="expertise" enterKeyHint="next" placeholder="e.g. Design, Coding" {...register("expertise")} /></div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(1)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">{t("apply.back")}</Button><Button type="button" onClick={()=>next(["firstChoicePositionId"])} className="flex-1 sm:flex-none">{t("apply.next")}</Button>
          </div>
        </Card>
      )}

      {step===3 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("apply.experienceTitle")}</h3>
          <div><Label htmlFor="experience">{t("apply.prevClubExperience")}</Label><Textarea id="experience" rows={2} enterKeyHint="next" placeholder={t("apply.prevClubPlaceholder")} {...register("experience")} /></div>
          <div><Label htmlFor="leadershipExperience">{t("apply.leadership")}</Label><Textarea id="leadershipExperience" rows={2} {...register("leadershipExperience")} /></div>
          <div><Label htmlFor="projects">{t("apply.projects")}</Label><Textarea id="projects" rows={2} placeholder={t("apply.linksDesc")} {...register("projects")} /></div>
          <div><Label htmlFor="competitions">{t("apply.competitions")}</Label><Textarea id="competitions" rows={2} {...register("competitions")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="githubUrl">{t("apply.githubUrl")}</Label><Input id="githubUrl" type="url" inputMode="url" autoComplete="url" placeholder="https://github.com/..." {...register("githubUrl")} />{errText("githubUrl")}</div>
            <div><Label htmlFor="portfolioUrl">{t("apply.portfolioUrl")}</Label><Input id="portfolioUrl" type="url" inputMode="url" autoComplete="url" placeholder="https://..." {...register("portfolioUrl")} />{errText("portfolioUrl")}</div>
          </div>
          <div><Label htmlFor="otherLinks">{t("apply.otherLinks")}</Label><Input id="otherLinks" type="url" inputMode="url" placeholder={t("apply.linkedinEtc")} {...register("otherLinks")} /></div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(2)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">{t("apply.back")}</Button><Button type="button" onClick={()=>setStep(4)} className="flex-1 sm:flex-none">{t("apply.next")}</Button>
          </div>
        </Card>
      )}

      {step===4 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("apply.motivationTitle")}</h3>
          <div><Label htmlFor="motivation">{t("apply.whyJoin")} *</Label><Textarea id="motivation" rows={3} {...register("motivation")} />{errText("motivation")}</div>
          <div><Label htmlFor="positionReason">{t("apply.whyPosition")} *</Label><Textarea id="positionReason" rows={3} {...register("positionReason")} />{errText("positionReason")}</div>
          <div><Label htmlFor="contribution">{t("apply.contribute")} *</Label><Textarea id="contribution" rows={3} {...register("contribution")} />{errText("contribution")}</div>
          <div><Label htmlFor="proposedActivities">{t("apply.activities")} *</Label><Textarea id="proposedActivities" rows={3} {...register("proposedActivities")} />{errText("proposedActivities")}</div>
          <div><Label htmlFor="timeCommitment">{t("apply.timeCommitment")} *</Label>
            <Select id="timeCommitment" {...register("timeCommitment")}><option value="">{t("apply.select")}</option>{TIME_COMMITMENTS.map(c=><option key={c} value={c}>{t(`timeCommitment.${c}`)}</option>)}</Select>
            {errText("timeCommitment")}
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(3)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">{t("apply.back")}</Button><Button type="button" onClick={async()=>{const ok=await trigger(["motivation","positionReason","contribution","proposedActivities","timeCommitment"] as never); if(ok) setStep(5);}} className="flex-1 sm:flex-none">{t("apply.next")}</Button>
          </div>
        </Card>
      )}

      {step===5 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("apply.confirmation")}</h3>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 sm:p-4 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <p className="break-words"><b className="text-zinc-900 dark:text-zinc-100">{t("apply.name")}:</b> {getValues("fullName")} · <b className="text-zinc-900 dark:text-zinc-100">{t("apply.email")}:</b> <span className="break-all">{getValues("email")}</span></p>
            <p className="break-words"><b className="text-zinc-900 dark:text-zinc-100">{t("apply.gradeShort")}:</b> {getValues("grade")} {getValues("section")}{getValues("studentId") ? <> · <b className="text-zinc-900 dark:text-zinc-100">{t("apply.id")}:</b> {getValues("studentId")}</> : null}</p>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm has-[input:checked]:border-zinc-900 has-[input:checked]:bg-zinc-50 sm:p-3.5 dark:border-zinc-700 dark:bg-zinc-800/50">
            <input type="checkbox" {...register("confirm")} className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-300 accent-zinc-900" />
            <span className="leading-5">{t("apply.confirmAccuracy")} *</span>
          </label>
          {errText("confirm")}
          {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
          <div className="sticky bottom-0 -mx-4 mt-2 flex gap-2 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-900/95 sm:dark:bg-transparent">
            <Button type="button" onClick={()=>setStep(4)} className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 sm:flex-none">{t("apply.back")}</Button><Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">{submitting?t("apply.submitting"):t("apply.submit")}</Button>
          </div>
        </Card>
      )}
    </form>
  );
}
