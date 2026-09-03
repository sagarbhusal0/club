import { db } from "@/db";
import { boardPositions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import ApplyForm from "./ApplyForm";
import { BOARD_POSITIONS_FALLBACK, BOARD_OPEN_POSITION_NAMES } from "@/lib/constants";
import { getLocale } from "@/lib/i18n-server";
import { formatDateLocale, makeT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplyPage() {
  let positions: { id:string; name:string }[] = [];
  const locale = await getLocale();
  const t = makeT(locale);
  let deadline = "";
  try {
    positions = await db.select({ id: boardPositions.id, name: boardPositions.name }).from(boardPositions).where(eq(boardPositions.isActive,true));
    const rows = await db.select().from(settings);
    const m = Object.fromEntries(rows.map(r=>[r.key,r.value]));
    if (m.board_closes) deadline = `${formatDateLocale(locale, m.board_closes)} — 11:59 PM`;
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
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("apply.title")}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t("apply.apply")}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("apply.timeEstimate")} {deadline}.</p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="inline-flex rounded-full border border-zinc-900 bg-zinc-900 px-2.5 py-1 font-semibold uppercase tracking-widest text-white dark:border-white dark:bg-white dark:text-zinc-900">Member</span>
          <span className="text-zinc-500 dark:text-zinc-400">· {positions.length} {t("boardPage.available")}</span>
          <span className="text-zinc-300">·</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{deadline}</span>
        </div>
        {positions.some(p=>p.id.startsWith("fallback")) && <p className="mt-3 text-xs leading-5 text-zinc-400">{t("apply.positionsOffline")}</p>}
        <div className="mt-6"><ApplyForm positions={positions} /></div>
      </div>
    </div>
  );
}
