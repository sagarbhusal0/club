import { db } from "@/db";
import { boardPositions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import ApplyForm from "./ApplyForm";
import { BOARD_POSITIONS_FALLBACK, BOARD_OPEN_POSITION_NAMES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplyPage() {
  let positions: { id:string; name:string }[] = [];
  let deadline = "Mon, 31 Aug 2026 — 11:59 PM";
  try {
    positions = await db.select({ id: boardPositions.id, name: boardPositions.name }).from(boardPositions).where(eq(boardPositions.isActive,true));
    const rows = await db.select().from(settings);
    const m = Object.fromEntries(rows.map(r=>[r.key,r.value]));
    if (m.board_closes) deadline = `${m.board_closes} — 11:59 PM`;
  } catch {}
  {
    const byName = new Map(positions.map((p) => [p.name, p]));
    if (positions.length === 0) {
      positions = BOARD_POSITIONS_FALLBACK.map((p) => ({ id: p.id, name: p.name }));
    } else {
      const merged: typeof positions = [];
      for (const name of BOARD_OPEN_POSITION_NAMES) {
        const hit = byName.get(name as string);
        if (hit) merged.push(hit as typeof positions[number]);
        else {
          const fb = BOARD_POSITIONS_FALLBACK.find((f) => f.name === name);
          if (fb) merged.push({ id: fb.id, name: fb.name });
        }
      }
      positions = merged.length ? merged : BOARD_POSITIONS_FALLBACK.map((p) => ({ id: p.id, name: p.name }));
    }
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Board Application</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">All fields marked * are required. Takes ~5 minutes.</p>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">⏰ Deadline: <b>{deadline}</b> · {positions.length} positions open</div>
      {positions.some(p=>p.id.startsWith("fallback")) && <p className="mt-2 text-xs text-zinc-500">Positions are temporarily loaded offline — your application will still be received.</p>}
      <div className="mt-6"><ApplyForm positions={positions} /></div>
    </div>
  );
}
