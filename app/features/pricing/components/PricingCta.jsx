import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";

export function PricingCta() {
  const { t } = useTranslation("pricing");
  const lang = useLocale();

  return (
    <section
      aria-labelledby="pricing-cta-title"
      className="mx-auto w-full max-w-content px-4 py-20 sm:px-6 md:py-28 lg:px-8 3xl:max-w-wide 3xl:py-36"
    >
      <Card className="gap-8 rounded-lg border-0 bg-brand-900 px-6 py-10 text-white shadow-none md:flex-row md:items-center md:justify-between md:px-12 md:py-12 3xl:px-16 3xl:py-16">
        <CardHeader className="min-w-0 gap-3 px-0 md:flex-1">
          <CardTitle>
            <h2 id="pricing-cta-title" className="text-fluid-xl leading-tight font-bold tracking-tight text-white">
              {t("cta.title")}
            </h2>
          </CardTitle>
          <CardDescription className="max-w-xl text-base leading-relaxed text-neutral-300">
            {t("cta.body")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-3 px-0 sm:flex-row md:shrink-0">
          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-sm bg-white font-semibold text-brand-900 no-underline hover:bg-neutral-100 sm:w-auto"
          >
            <Link to="/get-started">{t("cta.primary")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-sm border-white/30 bg-transparent font-semibold text-white no-underline hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Link to={localePath(lang, "/contact")}>{t("cta.secondary")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
