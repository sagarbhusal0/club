import Link from "next/link";
import { db } from "@/db";
import { boardPositions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registrationStatus } from "@/lib/utils";
import { BOARD_POSITIONS_FALLBACK, BOARD_OPEN_POSITION_NAMES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BoardRecruitmentPage() {
  let positions: { id:string; name:string; description:string|null; isActive:boolean }[] = [];
  let s: Record<string,string> = {};
  try {
    positions = await db.select().from(boardPositions).where(eq(boardPositions.isActive,true));
    const rows = await db.select().from(settings);
    s = Object.fromEntries(rows.map(r=>[r.key,r.value]));
  } catch {}
  {
    const byName = new Map(positions.map((p) => [p.name, p]));
    if (positions.length === 0) {
      positions = BOARD_POSITIONS_FALLBACK as typeof positions;
    } else {
      const merged: typeof positions = [];
      for (const name of BOARD_OPEN_POSITION_NAMES) {
        const hit = byName.get(name as string);
        if (hit) merged.push(hit as typeof positions[number]);
        else {
          const fb = BOARD_POSITIONS_FALLBACK.find((f) => f.name === name);
          if (fb) merged.push(fb as unknown as typeof positions[number]);
        }
      }
      positions = merged.length ? merged : (BOARD_POSITIONS_FALLBACK as typeof positions);
    }
  }
  const status = registrationStatus(s.board_opens||"2026-01-01", s.board_closes||"2026-12-31");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Board Recruitment 2026</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">Join the ICT Club committee. Applications are <span className="font-semibold dark:text-zinc-100">{status.replace("_"," ")}</span>.</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Opens: {s.board_opens||"—"} · <span className="font-semibold text-amber-600 dark:text-amber-400">Deadline: {s.board_closes||"—"} (Mon, 31 Aug 2026 — 11:59 PM)</span></p>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">⏰ Board applications close <b>Monday, 31 Aug 2026 at 11:59 PM</b>. Apply now!</div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status==="OPEN"
          ? <Link href="/board-recruitment/apply" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] sm:w-auto">Apply Now →</Link>
          : <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-200 px-8 py-3.5 text-[15px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto">Applications {status.replace("_"," ")}</span>}
        <Link href="/board-recruitment/status" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto">Check Status</Link>
      </div>

      <h2 className="mt-8 text-lg font-bold tracking-tight sm:mt-10 sm:text-xl">Available Positions</h2>
      <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
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
