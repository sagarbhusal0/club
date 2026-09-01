import Link from "next/link";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { registrationStatus, hackathonStatus } from "@/lib/utils";

async function getSettings() {
  try {
    const rows = await db.select().from(settings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {} as Record<string, string>;
  }
}

const domains = ["AI / Machine Learning", "Cybersecurity", "Web Development", "Software Development", "Cloud / DevOps", "Programming", "Open Source"];

export default async function Home() {
  const s = await getSettings();
  const boardStatus = registrationStatus(s.board_opens || "2026-01-01", s.board_closes || "2026-12-31");
  const hackStatus = hackathonStatus(s.hackathon_opens || "2026-01-01", s.hackathon_closes || "2026-12-31");

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
                style={{ animation: "fadeUp 420ms var(--ease-out) both" }}
              >
                Mavi Imiliya — ICT Club · Est. 2024
              </p>
              <h1
                className="mt-4 text-[34px] font-[650] leading-[0.95] tracking-[-0.04em] text-zinc-900 antialiased sm:text-[44px] lg:text-[56px] dark:text-zinc-100"
                style={{ animation: "fadeUp 420ms var(--ease-out) 60ms both" }}
              >
                Learn.
                <br />
                Build.
                <br />
                <span className="text-zinc-400 dark:text-zinc-600">Lead.</span>
              </h1>
              <p
                className="mt-5 max-w-[48ch] text-[15px] leading-6 text-zinc-600 dark:text-zinc-400"
                style={{ animation: "fadeUp 420ms var(--ease-out) 120ms both" }}
              >
                The most active technology community on campus. Real projects, workshops, and mentorship — from AI and cybersecurity to web and open source.
              </p>
              <div
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                style={{ animation: "fadeUp 420ms var(--ease-out) 180ms both" }}
              >
                <Link
                  href="/board-recruitment"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold tracking-tight text-white antialiased transition-[transform,background-color] duration-150 ease-out hover:bg-black active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Apply as Member — deadline Mon 31 Aug
                </Link>
                {hackStatus === "OPEN" ? (
                  <Link
                    href="/hackathon"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 transition-[transform,background-color,border-color] duration-150 ease-out hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Hackathon
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-6 text-sm font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
                    Hackathon — Closed
                  </span>
                )}
              </div>
              <div
                className="mt-6 flex flex-wrap items-center gap-2 text-xs"
                style={{ animation: "fadeUp 420ms var(--ease-out) 220ms both" }}
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium ${boardStatus === "OPEN" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : boardStatus === "CLOSED" ? "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${boardStatus === "OPEN" ? "bg-emerald-400" : boardStatus === "CLOSED" ? "bg-zinc-300" : "bg-amber-400"}`} />
                  Board: {boardStatus.replace("_", " ")}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium ${hackStatus === "OPEN" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${hackStatus === "OPEN" ? "bg-emerald-400" : "bg-zinc-300"}`} />
                  Hackathon: {hackStatus.replace("_", " ")}
                </span>
                <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">·</span>
                <span className="text-zinc-500 dark:text-zinc-400">Deadline Mon, 31 Aug — 11:59 PM</span>
              </div>
            </div>

            <div className="grid gap-3" style={{ animation: "fadeUp 420ms var(--ease-out) 260ms both" }}>
              <div className="rounded-[20px] border border-zinc-200 bg-[#fcfcfb] p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Now open</p>
                    <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Member — General membership</p>
                    <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">One role. Direct application. No second choice.</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold tracking-widest text-white dark:bg-white dark:text-zinc-900">OPEN</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Opens</p>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.board_opens || "2026-08-26"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Deadline</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.board_closes || "2026-08-31"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">11:59 PM</p>
                  </div>
                  <div className="text-right">
                    <Link
                      href="/board-recruitment/apply"
                      className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-900 px-3 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
                    >
                      Apply →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">Need your application ID?</span>
                <Link href="/board-recruitment/status" className="font-semibold text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700">
                  Check status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">About</p>
            <h2 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100">A club that ships.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              ICT Mavi Imiliya Club is for students who want to make things — not just talk about them. Small teams, real projects, and mentors who care about craft.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/board-recruitment"
              className="group rounded-[20px] border border-zinc-200 bg-white p-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Board Recruitment</p>
              <p className="mt-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Member — 1 position</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">Apply till Mon 31 Aug. Takes ~5 minutes.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                View details <span aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
            <Link
              href="/hackathon"
              className="group rounded-[20px] border border-zinc-200 bg-white p-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Hackathon</p>
              <p className="mt-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Teams of 4</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">Registration currently closed. Browse status.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Explore <span aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex items-baseline justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Technical domains</h2>
          <span className="hidden text-xs text-zinc-400 sm:inline">Hover — subtle lift. No gimmicks.</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-0 overflow-hidden rounded-[16px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-4">
          {domains.map((d, i) => (
            <div
              key={d}
              className="group relative border-b border-r border-zinc-100 p-4 text-sm font-medium leading-tight text-zinc-700 transition-colors duration-150 ease-out last:border-b-0 hover:bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50 sm:p-5"
              style={{ animation: `fadeUp 360ms var(--ease-out) ${i * 40}ms both` }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">0{i + 1}</span>
              <p className="mt-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Important dates</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[16px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Board</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Opens</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.board_opens || "2026-08-26"}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Deadline</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.board_closes || "2026-08-31"} · 11:59 PM</span>
              </p>
            </div>
            <p className="mt-3 rounded-full bg-zinc-900 px-3 py-1.5 text-center text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">Mon, 31 Aug</p>
          </div>
          <div className="rounded-[16px] border border-zinc-200 bg-white p-5 opacity-70 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Hackathon Reg</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Opens</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.hackathon_opens || "—"}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-zinc-500 dark:text-zinc-400">Closes</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.hackathon_closes || "—"}</span>
              </p>
            </div>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Currently closed</p>
          </div>
          <div className="rounded-[16px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Hackathon Day</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{s.hackathon_date || "TBA"}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Keep an eye on announcements</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-[20px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Contact</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                <a href="mailto:sagar@sagarb.com" className="font-medium text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700">
                  sagar@sagarb.com
                </a>{" "}
                <span className="text-zinc-400">·</span> Mavi Imiliya, Nepal
              </p>
            </div>
            <Link
              href="/board-recruitment/apply"
              className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
            >
              Apply now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
