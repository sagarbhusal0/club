import { db } from "@/db";
import { settings } from "@/db/schema";
import HackathonForm from "./HackathonForm";

export default async function RegisterPage() {
  let categories = ["AI/ML","Cybersecurity","Web Development","Software Development","Cloud/DevOps","Open Source","General"];
  try {
    const rows = await db.select().from(settings);
    const m = Object.fromEntries(rows.map(r=>[r.key,r.value]));
    if (m.hackathon_categories) categories = m.hackathon_categories.split(",").map((s:string)=>s.trim());
  } catch {}
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Hackathon Team Registration</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Exactly 4 members required. First member is the team leader.</p>
      <div className="mt-6"><HackathonForm categories={categories} /></div>
    </div>
  );
}
