import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from "./i18n";

// Server-only: read the locale preference from the cookie (default "en").
export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
}
