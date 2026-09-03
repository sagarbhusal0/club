"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildHackathonSchema } from "@/lib/validation";
import { submitHackathonTeam } from "@/actions/hackathon";
import { Input, Textarea, Select, Label, Button, Card } from "@/components/ui";
import { MEMBER_ROLES } from "@/lib/constants";
import { useT, getDict } from "@/components/LocaleProvider";
import { roleLabel } from "@/lib/i18n";

type FormData = {
  teamName: string; projectTitle: string; category: string; description: string;
  problemStatement?: string; solution?: string; technologyStack?: string;
  projectIdeaSummary: string;
  members: { fullName:string; email:string; phone:string; grade:string; section:string; studentId:string; role:string; githubUrl?:string; isLeader?:boolean }[];
  confirmInfo: true; confirmScratch: true;
};

const emptyMember = (leader=false) => ({ fullName:"", email:"", phone:"", grade:"", section:"", studentId:"", role: leader ? "Team Leader" : "Developer", githubUrl:"", isLeader: leader });

export default function HackathonForm({ categories, maxTeams = 0 }: { categories: string[]; maxTeams?: number }) {
  const { locale, t } = useT();
  const dict = getDict(locale);
  const [step,setStep]=useState(1);
  const [done,setDone]=useState<{teamNumber:string;teamName:string}|null>(null);
  const [err,setErr]=useState(""); const [submitting,setSubmitting]=useState(false);
  const { register, handleSubmit, trigger, watch, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(buildHackathonSchema(dict.validation)) as never,
    defaultValues: { members:[ emptyMember(true), emptyMember(false), emptyMember(false)] } as unknown as FormData,
    mode: "onBlur",
  });

  const onInvalid = (errs: unknown) => { const m = JSON.stringify(errs, null, 2); setErr("Please check the form: " + m.slice(0,500)); console.error("validation errors", errs); };
  const onSubmit = async (data: FormData) => {
    setErr(""); setSubmitting(true);
    const res = await submitHackathonTeam({ ...data, members: data.members.map((m,i)=>({ ...m, isLeader: i===0 })) }, "client", locale);
    setSubmitting(false);
    if ("error" in res && res.error) setErr(res.error);
    else if ("teamNumber" in res) { setDone(res as never); window.scrollTo({ top:0, behavior:"smooth" }); }
  };

  const e = errors as Record<string, { message?: string }>;
  const values = watch();

  async function next(n:number){
    let fields: string[] = [];
    if(n===1) fields=["teamName","projectTitle","category","description","projectIdeaSummary"];
    if(n===2) fields=["members.0.fullName","members.0.email","members.0.phone","members.0.grade","members.0.section","members.0.studentId","members.0.role"];
    if(n===3) fields=["members.1.fullName","members.1.email","members.1.phone","members.1.grade","members.1.section","members.1.studentId","members.1.role"];
    if(n===4) fields=["members.2.fullName","members.2.email","members.2.phone","members.2.grade","members.2.section","members.2.studentId","members.2.role"];
    const ok = await trigger(fields as never, { shouldFocus:true });
    if(ok) { setStep(n+1); window.scrollTo({top:0,behavior:"smooth"}); }
  }

  if (done) return (
    <Card className="text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-2xl">🎉</p>
      <h2 className="text-xl font-bold">{t("register.success")}</h2>
      <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-400">{t("register.teamId")} <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{done.teamNumber}</span></p>
      <p className="text-sm break-words dark:text-zinc-300">{t("register.team")} {done.teamName} · {t("register.status")}</p>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("register.saveTeamId")}</p>
      <a href={`/hackathon/success?teamNumber=${encodeURIComponent(done.teamNumber)}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">{t("register.viewSuccess")}</a>
    </Card>
  );

  const stepLabels = [t("register.stepTeamProject"), t("register.stepLeader"), t("register.stepMember2"), t("register.stepMember3"), t("register.stepConfirm")];

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 sm:space-y-6" noValidate>
      <div className="flex items-center gap-2 text-xs font-medium">
        {[1,2,3,4,5].map(n=>(
          <div key={n} className="flex flex-1 items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step>=n ? "bg-indigo-600 text-white" : step===n ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>{n}</span>
            {n<5 && <span className={`h-0.5 flex-1 rounded ${step>n ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{stepLabels[step-1]}</p>

      {step===1 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="text-[15px] font-bold sm:text-base">{t("register.teamProjectTitle")}</h3>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{maxTeams > 0 ? `${t("register.unlimitedRegistrationLine")} ${maxTeams} ${t("register.teamSlotsWillBeSelected")} ${t("register.willBeSelected")} (${maxTeams * 3} ${t("register.participants")}) · ` : `${t("register.unlimitedTeams")} · `}{t("register.perTeam")} · {t("register.oneStudentOnly")} · {t("register.buildScratchEvent")}</p>
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium leading-5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">{t("register.englishOnly")}</p>
          <div><Label htmlFor="teamName">{t("register.teamName")} *</Label><Input id="teamName" autoComplete="off" enterKeyHint="next" {...register("teamName")} />{e.teamName && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.teamName.message}</p>}</div>
          <div><Label htmlFor="projectTitle">{t("register.projectTitle")} *</Label><Input id="projectTitle" enterKeyHint="next" {...register("projectTitle")} />{e.projectTitle && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.projectTitle.message}</p>}</div>
          <div><Label htmlFor="category">{t("register.category")} *</Label>
            <Select id="category" {...register("category")}><option value="">{t("register.selectCategory")}</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</Select>
            {e.category && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.category.message}</p>}
          </div>
          <div><Label htmlFor="description">{t("register.projectDescription")} *</Label><Textarea id="description" rows={3} placeholder={t("register.descPlaceholder")} {...register("description")} />{e.description && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{e.description.message}</p>}</div>
          <div><Label htmlFor="problemStatement">{t("register.problemStatement")} <span className="font-normal text-zinc-400">— {t("dashboard.idAlternative") === "वैकल्पिक" ? "optional" : "optional"}</span></Label><Textarea id="problemStatement" rows={2} {...register("problemStatement")} /></div>
          <div><Label htmlFor="solution">{t("register.proposedSolution")} <span className="font-normal text-zinc-400">— optional</span></Label><Textarea id="solution" rows={2} {...register("solution")} /></div>
          <div><Label htmlFor="technologyStack">{t("register.techStack")} <span className="font-normal text-zinc-400">— optional</span></Label><Input id="technologyStack" placeholder="Next.js, Python, ..." {...register("technologyStack")} /></div>
          <div><Label htmlFor="projectIdeaSummary">{t("register.ideaSummary")} *</Label><Textarea id="projectIdeaSummary" rows={4} placeholder={t("register.ideaPlaceholder")} {...register("projectIdeaSummary")} />{ (e as never as { projectIdeaSummary?: { message:string } }).projectIdeaSummary && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{(e as never as { projectIdeaSummary: { message:string } }).projectIdeaSummary.message}</p>}<p className="mt-1 text-xs text-zinc-400">{t("register.ideaNote")}</p></div>
          <Button type="button" onClick={()=>next(1)} className="w-full sm:w-auto">{t("register.continue")}</Button>
        </Card>
      )}

      {step===2 && (
        <Card className="space-y-3" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">{t("register.leaderTitle")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>{t("apply.fullName")} *</Label><Input {...register("members.0.fullName" as never)} /></div>
            <div><Label>{t("apply.email")} *</Label><Input type="email" {...register("members.0.email" as never)} /></div>
            <div><Label>{t("apply.phone")} *</Label><Input type="tel" {...register("members.0.phone" as never)} placeholder="98XXXXXXXX" /></div>
            <div><Label>{t("apply.grade")} *</Label><Input {...register("members.0.grade" as never)} /></div>
            <div><Label>{t("apply.section")} *</Label><Input {...register("members.0.section" as never)} /></div>
            <div><Label>{t("apply.studentId")} *</Label><Input {...register("members.0.studentId" as never)} /></div>
            <div><Label>{t("register.role")} *</Label><Input value={t("roles.Team Leader")} readOnly className="bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100" /><input type="hidden" {...register("members.0.role" as never)} /></div>
            <div><Label>{t("register.githubUrl")} <span className="font-normal text-zinc-400">— optional</span></Label><Input type="url" placeholder="https://github.com/..." {...register("members.0.githubUrl" as never)} /></div>
          </div>
          <div className="flex gap-2 pt-2"><Button type="button" onClick={()=>setStep(1)} className="bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100">← {t("apply.back")}</Button><Button type="button" onClick={()=>next(2)}>{t("register.continue")}</Button></div>
        </Card>
      )}
      {step===3 && (
        <Card className="space-y-3" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">{t("register.member2")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>{t("apply.fullName")} *</Label><Input {...register("members.1.fullName" as never)} /></div>
            <div><Label>{t("apply.email")} *</Label><Input type="email" {...register("members.1.email" as never)} /></div>
            <div><Label>{t("apply.phone")} *</Label><Input type="tel" {...register("members.1.phone" as never)} /></div>
            <div><Label>{t("apply.grade")} *</Label><Input {...register("members.1.grade" as never)} /></div>
            <div><Label>{t("apply.section")} *</Label><Input {...register("members.1.section" as never)} /></div>
            <div><Label>{t("apply.studentId")} *</Label><Input {...register("members.1.studentId" as never)} /></div>
            <div><Label>{t("register.role")} *</Label><Select {...register("members.1.role" as never)}>{MEMBER_ROLES.filter(r=>r!=="Team Leader").map(r=><option key={r} value={r}>{roleLabel(locale, r)}</option>)}</Select></div>
            <div><Label>{t("register.githubUrl")} <span className="font-normal text-zinc-400">— optional</span></Label><Input type="url" placeholder="https://github.com/..." {...register("members.1.githubUrl" as never)} /></div>
          </div>
          <div className="flex gap-2 pt-2"><Button type="button" onClick={()=>setStep(2)} className="bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100">← {t("apply.back")}</Button><Button type="button" onClick={()=>next(3)}>{t("register.continue")}</Button></div>
        </Card>
      )}
      {step===4 && (
        <Card className="space-y-3" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">{t("register.member3")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>{t("apply.fullName")} *</Label><Input {...register("members.2.fullName" as never)} /></div>
            <div><Label>{t("apply.email")} *</Label><Input type="email" {...register("members.2.email" as never)} /></div>
            <div><Label>{t("apply.phone")} *</Label><Input type="tel" {...register("members.2.phone" as never)} /></div>
            <div><Label>{t("apply.grade")} *</Label><Input {...register("members.2.grade" as never)} /></div>
            <div><Label>{t("apply.section")} *</Label><Input {...register("members.2.section" as never)} /></div>
            <div><Label>{t("apply.studentId")} *</Label><Input {...register("members.2.studentId" as never)} /></div>
            <div><Label>{t("register.role")} *</Label><Select {...register("members.2.role" as never)}>{MEMBER_ROLES.filter(r=>r!=="Team Leader").map(r=><option key={r} value={r}>{roleLabel(locale, r)}</option>)}</Select></div>
            <div><Label>{t("register.githubUrl")} <span className="font-normal text-zinc-400">— optional</span></Label><Input type="url" placeholder="https://github.com/..." {...register("members.2.githubUrl" as never)} /></div>
          </div>
          <div className="flex gap-2 pt-2"><Button type="button" onClick={()=>setStep(3)} className="bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100">← {t("apply.back")}</Button><Button type="button" onClick={()=>next(4)}>{t("register.continue")}</Button></div>
        </Card>
      )}

      {step===5 && (
        <Card className="space-y-4" style={{ animation:"fadeUp 220ms var(--ease-out) both" }}>
          <h3 className="font-bold">{t("register.confirmation")}</h3>
          <div className="rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/60">
            <p className="font-semibold dark:text-zinc-100">{values.teamName || "—"} · {values.projectTitle || "—"}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{values.category || "—"} · {values.description?.slice(0,120) || "—"}</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("register.ideaSummary")}: {(values.projectIdeaSummary || "—").slice(0,200)}</p>
            <div className="mt-3 grid gap-1 text-xs dark:text-zinc-300">
              {(values.members || []).map((m,i)=><p key={i}>{i===0?"👑 ":""}{m.fullName || "—"} · {m.email || "—"} · {m.studentId || "—"} · {roleLabel(locale, m.role)}</p>)}
            </div>
          </div>
          <label className="flex gap-3 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"><input type="checkbox" {...register("confirmInfo" as never)} className="mt-0.5" /> <span>{t("register.confirmInfo")}</span></label>
          { (e as never as { confirmInfo?: { message:string } }).confirmInfo && <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">{(e as never as { confirmInfo: { message:string } }).confirmInfo.message}</p>}
          <label className="flex gap-3 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"><input type="checkbox" {...register("confirmScratch" as never)} className="mt-0.5" /> <span>{t("register.confirmScratch")}</span></label>
          { (e as never as { confirmScratch?: { message:string } }).confirmScratch && <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">{(e as never as { confirmScratch: { message:string } }).confirmScratch.message}</p>}
          { (errors as never as { members?: { message?:string } }).members && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{(errors as never as { members: { message:string } }).members.message}</p>}
          {Object.keys(errors).length>0 && <details className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800"><summary className="cursor-pointer font-medium">{t("register.validationDetails")}</summary><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-red-600 dark:text-red-300">{JSON.stringify(errors, null, 2).slice(0,1200)}</pre></details>}
          {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{err}</p>}
          <div className="flex gap-2 pt-2"><Button type="button" onClick={()=>setStep(4)} className="bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100">← {t("apply.back")}</Button><Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">{submitting?t("register.registering"):t("register.registerTeam")}</Button></div>
        </Card>
      )}

      {err && step!==5 && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{err}</p>}
    </form>
  );
}
