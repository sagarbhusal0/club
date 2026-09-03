import Link from "next/link";
import { db } from "@/db";
import { boardPositions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registrationStatus, formatDate } from "@/lib/utils";
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
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Board Recruitment 2026 — Open role</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em] text-zinc-900 antialiased sm:text-[32px] dark:text-zinc-100">
            Member<span className="font-normal text-zinc-400">. Apply by {s.board_closes ? formatDate(s.board_closes) : "—"}.</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${status==="OPEN" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status==="OPEN" ? "bg-emerald-400" : "bg-zinc-300"}`} />
              {status.replace("_"," ")}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Opens {s.board_opens || "2026-08-26"} · <span className="font-semibold text-zinc-900 dark:text-zinc-100">Deadline {s.board_closes || "2026-08-31"} — 11:59 PM</span>
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {status==="OPEN"
              ? <Link href="/board-recruitment/apply" className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold tracking-tight text-white antialiased hover:bg-black active:scale-[0.98] dark:bg-white dark:text-zinc-900">Apply as Member →</Link>
              : <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-6 text-sm font-medium text-zinc-500 dark:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">Applications {status.replace("_"," ")}</span>}
            <Link href="/board-recruitment/status" className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">Check status</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Available — {positions.length}</h2>
          <span className="text-xs text-zinc-400">Single position. No second choice.</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {positions.map((p) => (
            <div key={p.id} className="rounded-[16px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{p.name}</p>
                  {p.description && <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{p.description}</p>}
                </div>
                <span className="shrink-0 rounded-full border border-zinc-900 bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-white dark:border-white dark:bg-white dark:text-zinc-900">Open</span>
              </div>
              <Link href="/board-recruitment/apply" className="mt-4 inline-flex text-sm font-semibold text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700">Apply →</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
