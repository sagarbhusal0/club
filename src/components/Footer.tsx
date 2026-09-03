import Link from "next/link";
import { getLocale } from "@/lib/i18n-server";
import { makeT } from "@/lib/i18n";

export default async function Footer() {
  const locale = await getLocale();
  const t = makeT(locale);
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">ICT Mavi Imiliya Club</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{t("footer.tagline")}<br />{t("footer.location")}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("footer.explore")}</p>
              <div className="flex flex-col gap-1 text-zinc-600 dark:text-zinc-400">
                <Link href="/board-recruitment" className="hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100">{t("footer.board")}</Link>
                <Link href="/hackathon" className="hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100">{t("footer.hackathon")}</Link>
                <Link href="/dashboard" className="hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100">{t("footer.dashboard")}</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("footer.contact")}</p>
              <a href="mailto:sagar@sagarb.com" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">sagar@sagarb.com</a>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-100 pt-6 text-xs text-zinc-400 dark:border-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ICT Mavi Imiliya Club · {t("footer.craftedBy")} <a href="https://www.sagarb.com" target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 hover:decoration-zinc-900 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:text-white">Sagar Bhusal</a></span>
          <span className="hidden sm:inline">{t("footer.tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
