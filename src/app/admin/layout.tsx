import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  if (!s) redirect("/login");
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm font-medium">
          <Link href="/admin" className="font-bold text-indigo-600 dark:text-indigo-400">Dashboard</Link>
          <Link href="/admin/applications" className="hover:text-indigo-600 dark:hover:text-indigo-400">Applications</Link>
          <Link href="/admin/teams" className="hover:text-indigo-600 dark:hover:text-indigo-400">Teams</Link>
          <Link href="/admin/broadcast" className="hover:text-indigo-600 dark:hover:text-indigo-400">Broadcast</Link>
          <Link href="/admin/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400">Settings</Link>
          <span className="ml-auto text-xs text-zinc-500">{s.email}</span>
          <form action="/api/auth/logout" method="POST"><button className="rounded-lg border px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Logout</button></form>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
