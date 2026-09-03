"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Switch language / भाषा परिवर्तन"
      className={`inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-white p-0.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900 ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`min-h-9 min-w-10 rounded-full px-2 transition-colors ${locale === "en" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ne")}
        aria-pressed={locale === "ne"}
        className={`min-h-7 rounded-full px-2.5 transition-colors ${locale === "ne" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
      >
        ने
      </button>
    </div>
  );
}
