import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { registrationStatus, hackathonStatus } from "@/lib/utils";

async function getSettings() {
  try {
    const rows = await db.select().from(settings);
    return Object.fromEntries(rows.map(r=>[r.key,r.value]));
  } catch { return {} as Record<string,string>; }
}

const domains = ["AI / Machine Learning","Cybersecurity","Web Development","Software Development","Cloud / DevOps","Programming","Open Source"];

export default async function Home() {
  const s = await getSettings();
  const boardStatus = registrationStatus(s.board_opens||"2026-01-01", s.board_closes||"2026-12-31");
  const hackStatus = hackathonStatus(s.hackathon_opens||"2026-01-01", s.hackathon_closes||"2026-12-31");

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 px-4 py-10 sm:py-14 md:py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_10%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold tracking-widest opacity-80 sm:text-sm" style={{ animation:"fadeUp 420ms var(--ease-out) both" }}>Mavi Imiliya — ICT Club</p>
          <h1 className="mt-3 text-[30px] font-extrabold tracking-tight sm:text-4xl md:text-6xl" style={{ animation:"fadeUp 420ms var(--ease-out) 80ms both" }}>ICT Mavi Imiliya Club</h1>
          <p className="mt-2 text-lg opacity-90 sm:mt-3 sm:text-xl" style={{ animation:"fadeUp 420ms var(--ease-out) 160ms both" }}>Learn. Build. Lead.</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed opacity-80 sm:mt-4" style={{ animation:"fadeUp 420ms var(--ease-out) 200ms both" }}>Join the most active technology community — build real projects, compete, and lead.</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4" style={{ animation:"fadeUp 420ms var(--ease-out) 280ms both" }}>
            <Link href="/board-recruitment" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-indigo-700 shadow transition-[transform,background-color] duration-150 ease-out hover:bg-zinc-100 active:scale-[0.97] sm:w-auto sm:px-8">Apply for Board →</Link>
            {hackStatus==="OPEN"
              ? <Link href="/hackathon" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-[15px] font-semibold backdrop-blur transition-[transform,background-color] duration-150 ease-out hover:bg-white/20 active:scale-[0.97] sm:w-auto sm:px-8">Register for Hackathon</Link>
              : <span className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-[15px] font-semibold opacity-70 sm:w-auto sm:px-8">Hackathon Closed</span>}
          </div>
          <div className="mt-6 flex justify-center gap-3 text-xs" style={{ animation:"fadeUp 420ms var(--ease-out) 360ms both" }}>
            <span className={`rounded-full px-3 py-1 font-semibold ring-1 ring-white/20 ${boardStatus==="OPEN"?"bg-green-400 text-green-950":boardStatus==="CLOSED"?"bg-red-300 text-red-900":"bg-yellow-300 text-yellow-900"}`}>Board: {boardStatus.replace("_"," ")}</span>
            <span className={`rounded-full px-3 py-1 font-semibold ring-1 ring-white/20 ${hackStatus==="OPEN"?"bg-green-400 text-green-950":hackStatus==="CLOSED"?"bg-red-300 text-red-900":"bg-yellow-300 text-yellow-900"}`}>Hackathon: {hackStatus.replace("_"," ")}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">About the Club</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">ICT Mavi Imiliya Club empowers students to explore technology through hands-on projects, workshops, competitions and mentorship. Whether you love AI, cybersecurity, web development or open source — there is a place for you.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:gap-6 md:grid-cols-2">
        <div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold">Board Recruitment</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">12 positions available. Apply to lead the next committee.</p>
          <Link href="/board-recruitment" className="mt-4 inline-flex min-h-11 items-center gap-1 self-start rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] group-hover:gap-2">View Positions <span aria-hidden>→</span></Link>
        </div>
        <div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold">Hackathon</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Form a team of 4 and build something amazing.</p>
          <Link href="/hackathon" className="mt-4 inline-flex min-h-11 items-center gap-1 self-start rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-black active:scale-[0.97] group-hover:gap-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">Explore Hackathon <span aria-hidden>→</span></Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Technical Domains</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 md:grid-cols-4">
          {domains.map((d,i)=>(
            <div key={d} className="min-h-[84px] rounded-xl border border-zinc-200 bg-white px-3 py-5 text-center text-sm font-semibold shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-[1px] hover:shadow-md sm:px-4 sm:py-6 dark:border-zinc-800 dark:bg-zinc-900" style={{ animation:`fadeUp 360ms var(--ease-out) ${i*50}ms both` }}>{d}</div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Important Dates</h2>
        <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">BOARD</p><p className="mt-1 text-sm dark:text-zinc-200">Opens: {s.board_opens||"2026-08-26"}</p><p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Deadline: {s.board_closes||"2026-08-31"} · Mon, 31 Aug 11:59 PM</p></div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs font-semibold text-violet-600 dark:text-violet-400">HACKATHON REG</p><p className="mt-1 text-sm dark:text-zinc-200">Opens: {s.hackathon_opens||"—"}</p><p className="text-sm dark:text-zinc-200">Closes: {s.hackathon_closes||"—"}</p></div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">HACKATHON DAY</p><p className="mt-1 text-lg font-bold dark:text-zinc-100">{s.hackathon_date||"TBA"}</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl bg-zinc-900 p-8 text-white ring-1 ring-white/10 dark:bg-zinc-900 dark:ring-white/10">
          <h2 className="text-xl font-bold">Contact</h2>
          <p className="mt-2 text-sm opacity-80">Email: {s.contact_email||"sagar@sagarb.com"}</p>
          <p className="text-sm opacity-80">Mavi Imiliya, Nepal</p>
        </div>
      </section>
    </div>
  );
}
