"use client";
import { useState } from "react";

export type FAQItem = { q: string; a: string };

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/60 sm:gap-4 sm:px-5 sm:py-4"
            >
              <span className="text-[15px] font-semibold leading-5 text-zinc-900 dark:text-zinc-100 sm:text-sm">{it.q}</span>
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-transform dark:border-zinc-700 ${isOpen ? "rotate-45 border-zinc-900 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-500 dark:bg-zinc-800"}`}
              >
                +
              </span>
            </button>
            {isOpen && <p className="px-4 pb-3.5 text-[15px] leading-6 text-zinc-600 dark:text-zinc-400 sm:px-5 sm:pb-4 sm:text-sm">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
