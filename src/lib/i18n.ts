import en, { type Dict } from "./i18n/en";
import ne from "./i18n/ne";

export type Locale = "en" | "ne";
export const LOCALES: Locale[] = ["en", "ne"];
export const LOCALE_COOKIE = "locale";
export const LOCALE_TAGS: Record<Locale, string> = { en: "en-US", ne: "ne-NP" };

const dicts: Record<Locale, Dict> = { en, ne };

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ne";
}

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? en;
}

// Dot-path lookup with English fallback: t("nav.about"), t("statuses.APPROVED")
// Returns strings for leaf keys; arrays/objects for structured keys (e.g. checklistItems).
export function makeT(locale: Locale) {
  const dict = getDict(locale);
  return (key: string): string => {
    const resolve = (d: Dict | undefined): unknown =>
      key.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), d);
    const v = resolve(dict) ?? resolve(en);
    if (v === undefined) return key;
    if (typeof v === "string") return v;
    return v as unknown as string;
  };
}

export function statusLabel(locale: Locale, status: string): string {
  const t = makeT(locale);
  const v = t(`statuses.${status}`);
  return v === `statuses.${status}` ? status.replace(/_/g, " ") : v;
}

export function roleLabel(locale: Locale, role: string): string {
  const t = makeT(locale);
  const v = t(`roles.${role}`);
  return v === `roles.${role}` ? role : v;
}

export function categoryLabel(locale: Locale, category: string): string {
  const t = makeT(locale);
  const v = t(`categories.${category}`);
  return v === `categories.${category}` ? category : v;
}

export function formatDateLocale(locale: Locale, d: string | Date): string {
  try {
    return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { year: "numeric", month: "short", day: "numeric" }).format(new Date(d));
  } catch {
    return new Date(d).toLocaleDateString();
  }
}
