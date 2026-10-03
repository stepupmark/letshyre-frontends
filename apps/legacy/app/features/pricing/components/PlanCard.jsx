import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/features/pricing/lib/plans";
import { CHECKOUT_STATE, checkoutSearch } from "@/features/pricing/lib/checkout";

function linkProps(plan, lang) {
  if (plan.billing === "free") return { to: "/get-started" };
  if (plan.billing === "custom") return { to: localePath(lang, "/contact") };
  return { to: { search: checkoutSearch(plan.id) }, state: CHECKOUT_STATE, preventScrollReset: true };
}

export function PlanCard({ plan, status }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const isCustom = plan.billing === "custom";
  const price = plan.billing === "free" ? 0 : isCustom ? null : (plan.price ?? null);
  const pricePending = status === "loading" || status === "slow";

  const features = isCustom
    ? t("plans.custom.features", { returnObjects: true })
    : [
        plan.seats && t("plans.seats", { count: plan.seats }),
        t("plans.noExpiry"),
        plan.topUps && t("plans.topUps"),
      ].filter(Boolean);

  return (
    <Card
      className={cn(
        "row-span-4 grid grid-rows-subgrid gap-0 rounded-lg py-0 shadow-none",
        plan.featured ? "border-brand-600 bg-brand-100/60 ring-1 ring-brand-600" : "border-border",
      )}
    >
      <CardHeader className="gap-1.5 px-6 pt-6 3xl:px-7 3xl:pt-7">
        <CardTitle>
          <h3 className="text-lg font-bold text-text-main 3xl:text-xl">
            {t(`plans.${plan.id}.name`, { defaultValue: plan.name })}
          </h3>
        </CardTitle>
        <CardDescription className="text-sm leading-snug text-text-muted">
          {t(`plans.${plan.id}.audience`, { defaultValue: plan.tagline ?? "" })}
        </CardDescription>
        {plan.featured && (
          <CardAction>
            <Badge className="rounded-full bg-brand-600 px-2.5 py-1 font-semibold">
              {t(`plans.${plan.id}.badge`, { defaultValue: t("plans.recommended") })}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="px-6 pt-6 3xl:px-7">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {isCustom ? (
            <span className="text-4xl font-bold tracking-tight text-text-main 3xl:text-5xl">
              {t("plans.custom.price")}
            </span>
          ) : price !== null ? (
            <span className="text-4xl font-bold tracking-tight text-text-main tabular-nums 3xl:text-5xl">
              {formatPrice(lang, price)}
            </span>
          ) : pricePending ? (
            <Skeleton className="my-[0.15lh] h-[0.7lh] w-32 rounded-sm text-4xl 3xl:text-5xl" />
          ) : (
            <span className="text-4xl font-bold tracking-tight text-text-faint 3xl:text-5xl">
              <span aria-hidden="true">—</span>
              <span className="sr-only">{t("plans.unavailable")}</span>
            </span>
          )}
          <span className="text-sm text-text-muted">
            {t(`plans.${plan.id}.priceNote`, { defaultValue: t("plans.pro.priceNote") })}
          </span>
        </div>
        {!isCustom && (
          <p className="mt-3 text-sm font-semibold text-brand-700">
            {t("plans.credits", { count: plan.credits })}
          </p>
        )}
      </CardContent>

      <CardContent className="px-6 pt-6 3xl:px-7">
        <ul className="flex flex-col gap-3 border-t border-border pt-5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-text-body">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="items-end px-6 pt-8 pb-6 3xl:px-7 3xl:pb-7">
        <Button
          asChild
          size="lg"
          variant={plan.featured ? "default" : "outline"}
          className={cn(
            "h-11 w-full rounded-sm font-semibold no-underline",
            plan.featured ? "hover:bg-brand-700" : "border-border text-text-main hover:border-neutral-300",
          )}
        >
          <Link {...linkProps(plan, lang)}>
            {t(`plans.${plan.id}.cta`, { defaultValue: t("plans.buy", { name: plan.name }) })}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
