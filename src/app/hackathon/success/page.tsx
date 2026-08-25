export default function SuccessPage({ searchParams }: { searchParams: { teamNumber?:string } }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" style={{ animation:"scaleIn 320ms var(--ease-out) both" }}>
      <p className="text-3xl">🎉</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Registration Successful</h1>
      {searchParams.teamNumber && <p className="mt-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{searchParams.teamNumber}</p>}
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Status: REGISTERED — check your team status page for updates.</p>
    </div>
  );
}
