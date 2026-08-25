import Link from "next/link";
import { db } from "@/db";
import { boardApplications, boardPositions } from "@/db/schema";
import { desc, like, eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ q?:string; status?:string; page?:string }> }) {
  const { q, status, page } = await searchParams;
  const p = Math.max(1, parseInt(page||"1",10));
  const limit = 20; const offset = (p-1)*limit;

  let rows: typeof boardApplications.$inferSelect[] = [];
  let positions: Map<string,string> = new Map();
  try {
    const conds = [];
    if (q) conds.push(like(boardApplications.fullName, `%${q}%`));
    if (status) conds.push(eq(boardApplications.status, status));
    const where = conds.length ? and(...conds) : undefined;
    rows = await db.select().from(boardApplications).where(where).orderBy(desc(boardApplications.createdAt)).limit(limit).offset(offset);
    const pos = await db.select().from(boardPositions);
    positions = new Map(pos.map(x=>[x.id,x.name]));
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Board Applications</h1>
        <a href={`/api/export/applications`} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">Export CSV</a>
      </div>
      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name..." className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
        <select name="status" defaultValue={status||""} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
          <option value="">All statuses</option>
          {["SUBMITTED","UNDER_REVIEW","SHORTLISTED","INTERVIEW","SELECTED","WAITLISTED","REJECTED"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-black active:scale-[0.97] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Filter</button>
      </form>
      <div className="mt-4 overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400"><tr><th className="px-3 py-2 text-left">Application</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Position</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead>
          <tbody>
            {rows.length===0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">No applications found</td></tr>
            : rows.map(r=>(
              <tr key={r.id} className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                <td className="px-3 py-2 font-mono text-xs">{r.applicationNumber}</td>
                <td className="px-3 py-2">{r.fullName}<br/><span className="text-xs text-zinc-500 dark:text-zinc-400">{r.email}</span></td>
                <td className="px-3 py-2 text-xs dark:text-zinc-300">{r.firstChoicePositionId ? (positions.get(r.firstChoicePositionId)||"—") : "—"}</td>
                <td className="px-3 py-2"><Badge status={r.status} /></td>
                <td className="px-3 py-2"><Link href={`/admin/applications/${r.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
