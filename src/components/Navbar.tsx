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
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: close the mobile menu on navigation
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
    <header className="sticky top-0 z-40 isolate border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:bg-white/80 md:backdrop-blur md:supports-[backdrop-filter]:bg-white/70 dark:md:bg-zinc-950/70 dark:md:supports-[backdrop-filter]:bg-zinc-950/70" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3 py-1" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-black tracking-widest text-white dark:bg-white dark:text-zinc-900">IM</span>
          <span className="hidden text-sm font-semibold tracking-tight text-zinc-900 antialiased dark:text-zinc-100 sm:inline">ICT Mavi Imiliya Club</span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:hidden">ICT Mavi</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-3 py-2 font-medium transition-colors ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
              >
                {l.label}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-zinc-900 dark:bg-zinc-100" />}
              </Link>
            );
          })}
          <span className="mx-2 hidden h-4 w-px bg-zinc-200 dark:bg-zinc-800 lg:block" />
          <ThemeToggle />
          <Link href="/login" className="ml-1 inline-flex min-h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold tracking-tight text-white antialiased transition-colors hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <Link href="/login" className="inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            Login
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <span aria-hidden className="relative block h-[14px] w-[18px]">
              <span className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-[transform,opacity] duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-0.5 w-full rounded bg-current transition-opacity duration-150 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 top-[12px] h-0.5 w-full rounded bg-current transition-[transform] duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:hidden ${open ? "block" : "hidden"}`} hidden={!open}>
        <nav className="mx-auto max-w-6xl px-3 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="grid gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-900">
                {l.label}
              </Link>
            ))}
            <Link href="/board-recruitment/status" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 active:bg-zinc-100 dark:text-zinc-400">Check Board Status →</Link>
            <Link href="/hackathon/status" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 active:bg-zinc-100 dark:text-zinc-400">Check Hackathon Status →</Link>
          </div>
        </nav>
      </div>
      {open && <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 top-[57px] z-30 bg-zinc-900/20 md:hidden" />}
    </header>
  );
}
