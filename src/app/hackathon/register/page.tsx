export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Hackathon Registration — Closed</h1>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-semibold text-amber-900 dark:text-amber-200">Registration is Closed.</p>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">Hackathon is currently closed for new teams. Check back later or track your existing team below.</p>
        <a href="/hackathon/status" className="mt-4 inline-flex rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Check Team Status →</a>
      </div>
    </div>
  );
}
