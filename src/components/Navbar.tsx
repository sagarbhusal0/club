"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeProvider";

const links = [
  { href: "/about", label: "About" },
  { href: "/board-recruitment", label: "Board" },
  { href: "/hackathon", label: "Hackathon" },
  { href: "/dashboard", label: "My Applications" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/90 dark:supports-[backdrop-filter]:bg-zinc-900/80" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 py-1 font-bold tracking-tight text-zinc-900 dark:text-zinc-100" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">IM</span>
          <span className="text-[15px] leading-none sm:text-base">ICT Mavi Imiliya Club</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
              {l.label}
            </Link>
          ))}
          <div className="ml-1 flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
              Login
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            Login
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 active:scale-[0.97] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <span aria-hidden className="relative block h-[14px] w-[18px]">
              <span className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-[transform,opacity] duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-0.5 w-full rounded bg-current transition-opacity duration-150 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 top-[12px] h-0.5 w-full rounded bg-current transition-[transform] duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden ${open ? "block" : "hidden"}`}
        hidden={!open}
      >
        <nav className="mx-auto max-w-6xl px-3 py-3 sm:px-4" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="grid gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/board-recruitment/status"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
            >
              Check Board Status
            </Link>
            <Link
              href="/hackathon/status"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
            >
              Check Hackathon Status
            </Link>
          </div>
        </nav>
      </div>
      {open && <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 top-[57px] z-30 bg-zinc-900/20 backdrop-blur-[1px] md:hidden" />}
    </header>
  );
}
