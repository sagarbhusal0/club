"use client";
import { useEffect } from "react";
import { Badge } from "./ui";

export function NoteModal({ open, onClose, title, subtitle, status, note }: { open: boolean; onClose: () => void; title: string; subtitle?: string; status: string; note: string | null | undefined }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-zinc-900/40" />
      <div role="dialog" aria-modal="true" aria-label="Admin note" className="relative w-full max-w-lg rounded-[20px] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900" style={{ animation: "scaleIn 220ms var(--ease-out) both" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="break-all font-mono text-[12px] font-medium tracking-tight text-zinc-500 dark:text-zinc-400">{subtitle}</p>
            <p className="mt-1 break-words text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</p>
          </div>
          <Badge status={status} />
        </div>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Admin note</p>
          {note && note.trim() ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700 dark:text-zinc-300">{note}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-zinc-400">No admin note yet — check back after review.</p>
          )}
        </div>
        <button onClick={onClose} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900">Close</button>
      </div>
    </div>
  );
}
