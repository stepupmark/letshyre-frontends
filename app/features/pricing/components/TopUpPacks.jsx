import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/i18n/hooks";
import { PriceNotice } from "@/features/pricing/components/PriceNotice";
import { useTopUpPrices } from "@/features/pricing/hooks/useTopUpPrices";
import { TOP_UPS, formatPrice } from "@/features/pricing/lib/plans";
import { CHECKOUT_STATE, checkoutSearch, topUpKey } from "@/features/pricing/lib/checkout";

export function TopUpPacks() {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const pricing = useTopUpPrices();
  const pending = pricing.status === "loading" || pricing.status === "slow";

  return (
    <section
      aria-labelledby="top-ups-title"
      className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36"
    >
      <div className="max-w-2xl">
        <h2 id="top-ups-title" className="text-fluid-xl leading-tight font-bold tracking-tight text-text-main">
          {t("topUps.title")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{t("topUps.body")}</p>
      </div>

      <div className="mt-8">
        <PriceNotice status={pricing.status} onRetry={pricing.retry} isRetrying={pricing.isRetrying} />
      </div>

      <ul className="grid list-none grid-cols-1 gap-3 xs:grid-cols-2 md:gap-4 lg:grid-cols-4 3xl:gap-6">
        {TOP_UPS.map((pack) => {
          const amount = pricing.priceOf(pack.credits);
          const price = amount === null ? null : formatPrice(lang, amount);
          return (
            <li key={pack.credits}>
              <Card className="h-full gap-0 rounded-lg border-border py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6 md:pt-6">
                  <CardTitle>
                    <h3 className="text-base font-semibold text-text-main">
                      {t("topUps.credits", { count: pack.credits })}
                    </h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pt-3 md:px-6">
                  {price !== null ? (
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-2xl font-bold tracking-tight text-text-main tabular-nums 3xl:text-3xl">
                        {price}
                      </span>
                      <span className="text-sm text-text-muted">{t("topUps.priceNote")}</span>
                    </p>
                  ) : pending ? (
                    <Skeleton className="my-[0.15lh] h-[0.7lh] w-24 rounded-sm text-2xl 3xl:text-3xl" />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-text-faint 3xl:text-3xl">
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">{t("plans.unavailable")}</span>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="mt-auto px-5 pt-5 pb-5 md:px-6 md:pb-6">
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-sm border-border font-semibold text-text-main no-underline hover:border-neutral-300"
                  >
                    <Link
                      to={{ search: checkoutSearch(topUpKey(pack.credits)) }}
                      state={CHECKOUT_STATE}
                      preventScrollReset
                      aria-label={
                        price === null
                          ? t("topUps.ctaLabelNoPrice", { count: pack.credits })
                          : t("topUps.ctaLabel", { count: pack.credits, price })
                      }
                    >
                      {t("topUps.cta")}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
