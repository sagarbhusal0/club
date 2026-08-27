import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">ICT Mavi Imiliya Club</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">Learn. Build. Lead.<br />Mavi Imiliya, Nepal</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Explore</p>
              <div className="flex flex-col gap-1 text-zinc-600 dark:text-zinc-400">
                <Link href="/board-recruitment" className="hover:text-zinc-900 dark:hover:text-zinc-100">Board</Link>
                <Link href="/hackathon" className="hover:text-zinc-900 dark:hover:text-zinc-100">Hackathon</Link>
                <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">Dashboard</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Contact</p>
              <a href="mailto:sagar@sagarb.com" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">sagar@sagarb.com</a>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 text-xs text-zinc-400 dark:border-zinc-900">
          <span>© {new Date().getFullYear()} ICT Mavi Imiliya Club</span>
          <span className="hidden sm:inline">Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}
