import Link from "next/link";
import { ThemeToggle } from "./ThemeProvider";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">IM</span>
          ICT Mavi Imiliya Club
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100">About</Link>
          <Link href="/board-recruitment" className="hover:text-zinc-900 dark:hover:text-zinc-100">Board</Link>
          <Link href="/hackathon" className="hover:text-zinc-900 dark:hover:text-zinc-100">Hackathon</Link>
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">My Applications</Link>
          <ThemeToggle />
          <Link href="/login" className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Login</Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Link href="/dashboard" className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-700">Dashboard</Link>
        </div>
      </div>
    </header>
  );
}
