import fs from "fs";
let t = fs.readFileSync("src/app/hackathon/register/HackathonForm.tsx","utf8");

// The issue: step 5 submit fails silently because zod errors aren't shown
// Fix 1: onSubmit should show validation errors, add onInvalid handler
// Fix 2: Ensure Leader role is auto-set and not validated as empty
// Fix 3: Add visible error dump in step 5

// Replace the onSubmit + handleSubmit line to show all errors
t = t.replace(
  '  const onSubmit = async (data: FormData) => {',
  '  const onInvalid = (errs: unknown) => { const m = JSON.stringify(errs, null, 2); setErr("Please check the form: " + m.slice(0,500)); console.error("validation errors", errs); };\n  const onSubmit = async (data: FormData) => {'
);

// Update form handleSubmit to use onInvalid
t = t.replace(
  '    <form onSubmit={handleSubmit(onSubmit)}',
  '    <form onSubmit={handleSubmit(onSubmit, onInvalid)}'
);

// Fix Leader role: the hidden input value not syncing with RHF default
// Change emptyMember Leader role handling
t = t.replace(
  '            <div><Label>Role *</Label><Input value="Team Leader" readOnly className="bg-zinc-50 dark:bg-zinc-800" /><input type="hidden" {...register("members.0.role" as never)} value="Team Leader" /></div>',
  '            <div><Label>Role *</Label><Input value="Team Leader" readOnly className="bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100" /><input type="hidden" {...register("members.0.role" as never)} /></div>'
);

// Ensure error display shows field-level errors in step 5
t = t.replace(
  '          { (errors as never as { members?: { message?:string } }).members && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{(errors as never as { members: { message:string } }).members.message}</p>}',
  '          { (errors as never as { members?: { message?:string } }).members && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300" role="alert">{(errors as never as { members: { message:string } }).members.message}</p>}\n          {Object.keys(errors).length>0 && <details className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800"><summary className="cursor-pointer font-medium">Validation details</summary><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-red-600 dark:text-red-300">{JSON.stringify(errors, null, 2).slice(0,1200)}</pre></details>}'
);

fs.writeFileSync("src/app/hackathon/register/HackathonForm.tsx", t, "utf8");
console.log("fixed step 5");

// Also relax leader check: allow either isLeader flag or role === Team Leader
let v = fs.readFileSync("src/lib/validation.ts","utf8");
if(v.includes('Exactly one member must be the Team Leader')){
  // Keep validation but don't block if role is Team Leader for first member
  v = v.replace(
    '  const leaders = data.members.filter(m=>m.isLeader);\n  if (leaders.length !== 1) ctx.addIssue({ code:"custom", message:"Exactly one member must be the Team Leader", path:["members"]});\n  if (!data.members[0]?.isLeader) ctx.addIssue({ code:"custom", message:"First member must be the Team Leader", path:["members"]});',
    '  const leaders = data.members.filter(m=>m.isLeader || m.role==="Team Leader");\n  if (leaders.length !== 1) ctx.addIssue({ code:"custom", message:"Exactly one member must be the Team Leader", path:["members"]});\n  if (!(data.members[0]?.isLeader || data.members[0]?.role==="Team Leader")) ctx.addIssue({ code:"custom", message:"First member must be the Team Leader", path:["members"]});'
  );
  fs.writeFileSync("src/lib/validation.ts", v, "utf8");
  console.log("fixed validation leader check");
}
console.log("done");
