import Link from "next/link";
import { db } from "@/db";
import { hackathonTeams } from "@/db/schema";
import { desc, like, eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui";

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ q?:string; status?:string; category?:string }> }) {
  const { q, status, category } = await searchParams;
  let rows: typeof hackathonTeams.$inferSelect[] = [];
  try {
    const conds = [];
    if (q) conds.push(like(hackathonTeams.teamName, `%${q}%`));
    if (status) conds.push(eq(hackathonTeams.status, status));
    if (category) conds.push(eq(hackathonTeams.category, category));
    const where = conds.length ? and(...conds) : undefined;
    rows = await db.select().from(hackathonTeams).where(where).orderBy(desc(hackathonTeams.createdAt)).limit(50);
  } catch {}
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Hackathon Teams</h1>
        <a href="/api/export/teams" className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">Export CSV</a>
      </div>
      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search team..." className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
        <select name="status" defaultValue={status||""} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
          <option value="">All statuses</option>
          {["REGISTERED","UNDER_REVIEW","APPROVED","WAITLISTED","REJECTED","CHECKED_IN"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-black active:scale-[0.97] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Filter</button>
      </form>
      <div className="mt-4 overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400"><tr><th className="px-3 py-2 text-left">Team</th><th className="px-3 py-2">Project</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead>
          <tbody>
            {rows.length===0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">No teams found</td></tr>
            : rows.map(r=>(
              <tr key={r.id} className="border-t border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                <td className="px-3 py-2"><span className="font-mono text-xs">{r.teamNumber}</span><br/>{r.teamName}</td>
                <td className="px-3 py-2">{r.projectTitle}</td>
                <td className="px-3 py-2 text-xs dark:text-zinc-300">{r.category}</td>
                <td className="px-3 py-2"><Badge status={r.status} /></td>
                <td className="px-3 py-2"><Link href={`/admin/teams/${r.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
