"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";
import { getDict, makeT } from "@/lib/i18n";

const Ctx = createContext<{ locale: Locale }>({ locale: "en" });

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale }}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx).locale;
}

export function useT(): { locale: Locale; t: (key: string) => string } {
  const { locale } = useContext(Ctx);
  return { locale, t: makeT(locale) };
}

export { getDict };
