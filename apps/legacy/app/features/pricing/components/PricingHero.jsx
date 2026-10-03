import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export function PricingHero() {
  const { t } = useTranslation("pricing");
  const items = t("hero.items", { returnObjects: true });

  return (
    <section
      aria-labelledby="pricing-title"
      className="mx-auto w-full max-w-content px-4 pt-28 sm:px-6 md:pt-36 lg:px-8 3xl:max-w-wide 3xl:pt-44"
    >
      <p className="text-sm font-semibold text-brand-600 3xl:text-base">{t("hero.eyebrow")}</p>
      <h1
        id="pricing-title"
        className="mt-3 max-w-[22ch] text-fluid-2xl leading-tight font-bold tracking-tight text-balance text-text-main"
      >
        {t("hero.title")}
      </h1>
      <p className="mt-5 max-w-2xl text-fluid-base leading-relaxed text-text-muted 3xl:max-w-3xl">
        {t("hero.body")}
      </p>
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <p className="text-sm font-semibold text-text-main">{t("hero.includes")}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-body">
              <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
