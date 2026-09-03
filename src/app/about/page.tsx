import { getLocale } from "@/lib/i18n-server";
import { makeT } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = makeT(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("about.title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">{t("about.desc")}</p>
      <h2 className="mt-8 text-lg font-bold tracking-tight sm:text-xl">{t("about.mission")}</h2>
      <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">{t("about.missionDesc")}</p>
      <h2 className="mt-8 text-lg font-bold tracking-tight sm:text-xl">{t("about.whatWeDo")}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-600 sm:text-base dark:text-zinc-400"><li>{t("about.do1")}</li><li>{t("about.do2")}</li><li>{t("about.do3")}</li><li>{t("about.do4")}</li></ul>
    </div>
  );
}
