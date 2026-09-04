"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

const STORAGE_KEY = "hackathon-guide-checklist";

export type ChecklistItem = { id: string; label: string };

export default function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const { t } = useT();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {}
  }, [checked, hydrated]);

  const done = items.filter((it) => checked[it.id]).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold leading-5 text-zinc-900 dark:text-zinc-100 sm:text-sm">{t("hackathonGuide.checklistTitle")}</h3>
        <span className="inline-flex shrink-0 items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
          {done}/{items.length} · {pct}%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-indigo-600 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 grid gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3.5 text-[15px] leading-5 transition-colors active:scale-[0.995] sm:px-3.5 sm:py-3 sm:text-sm ${checked[it.id] ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/30" : "border-zinc-200 bg-white active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:active:bg-zinc-800"}`}>
              <input
                type="checkbox"
                checked={!!checked[it.id]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [it.id]: e.target.checked }))}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 sm:h-4 sm:w-4"
              />
              <span className={checked[it.id] ? "font-medium text-zinc-900 line-through decoration-zinc-400 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}>{it.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-4 text-zinc-400">{t("hackathonGuide.checklistNote")}</p>
    </div>
  );
}
