"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

export type GuideSection = { id: string; label: string };

export default function GuideNav({ sections }: { sections: GuideSection[] }) {
  const { t } = useT();
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.3, 0.6, 1] }
    );
    els.forEach((el) => obs.observe(el));
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((scrolled / max) * 100)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-indigo-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <nav aria-label={t("hackathonGuide.onThisPage")} className="hidden lg:block">
        <div className="sticky top-[88px] self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{t("hackathonGuide.onThisPage")}</p>
          <ul className="mt-3 space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${active === s.id ? "bg-zinc-900 font-semibold text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"}`}
                >
                  {active === s.id && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white dark:bg-zinc-900" aria-hidden />}
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <nav aria-label={t("hackathonGuide.onThisPage")} className="sticky top-[57px] z-30 -mx-4 max-w-[100vw] overflow-hidden border-b border-zinc-200 bg-white/90 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold leading-none transition-colors active:scale-[0.97] ${active === s.id ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"}`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
