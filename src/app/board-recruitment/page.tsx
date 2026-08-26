import Link from "next/link";
import { db } from "@/db";
import { boardPositions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registrationStatus } from "@/lib/utils";
import { BOARD_POSITIONS_FALLBACK } from "@/lib/constants";

export default async function BoardRecruitmentPage() {
  let positions: { id:string; name:string; description:string|null; isActive:boolean }[] = [];
  let s: Record<string,string> = {};
  try {
    positions = await db.select().from(boardPositions).where(eq(boardPositions.isActive,true));
    const rows = await db.select().from(settings);
    s = Object.fromEntries(rows.map(r=>[r.key,r.value]));
  } catch {}
  if (positions.length===0) positions = BOARD_POSITIONS_FALLBACK as typeof positions;
  const status = registrationStatus(s.board_opens||"2026-01-01", s.board_closes||"2026-12-31");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Board Recruitment 2026</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Join the ICT Club committee. Applications are <span className="font-semibold dark:text-zinc-100">{status.replace("_"," ")}</span>.</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Opens: {s.board_opens||"—"} · <span className="font-semibold text-amber-600 dark:text-amber-400">Deadline: {s.board_closes||"—"} (Mon, 31 Aug 2026 — 11:59 PM)</span></p>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">⏰ Board applications close <b>Monday, 31 Aug 2026 at 11:59 PM</b>. Apply now!</div>

      <div className="mt-6">
        {status==="OPEN"
          ? <Link href="/board-recruitment/apply" className="inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97]">Apply Now →</Link>
          : <span className="inline-block rounded-xl bg-zinc-200 px-8 py-3 font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Applications {status.replace("_"," ")}</span>}
        <Link href="/board-recruitment/status" className="ml-3 inline-block rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">Check Status</Link>
      </div>

      <h2 className="mt-10 text-xl font-bold tracking-tight">Available Positions</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {positions.length===0
          ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Positions will appear once configured.</p>
          : positions.map(p=>(
            <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold dark:text-zinc-100">{p.name}</p>
              {p.description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{p.description}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}
