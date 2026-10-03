import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/i18n/hooks";
import { PlanCard } from "@/features/pricing/components/PlanCard";
import { PriceNotice } from "@/features/pricing/components/PriceNotice";
import { usePlans } from "@/features/pricing/hooks/usePlans";
import { formatPrice, sharedRate } from "@/features/pricing/lib/plans";

export function PlanGrid() {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const { status, plans, retry, isRetrying } = usePlans();
  const pending = status === "loading" || status === "slow";
  const rate = status === "ready" ? sharedRate(plans) : null;

  return (
    <section
      aria-labelledby="plans-heading"
      className="mx-auto w-full max-w-content px-4 pt-12 sm:px-6 md:pt-16 lg:px-8 3xl:max-w-wide"
    >
      <h2 id="plans-heading" className="sr-only">
        {t("plans.heading")}
      </h2>

      <PriceNotice status={status} onRetry={retry} isRetrying={isRetrying} />

      {pending && (
        <span role="status" className="sr-only">
          {t("prices.loading")}
        </span>
      )}
      <div
        aria-busy={pending}
        className="mx-auto grid max-w-md grid-cols-1 gap-4 md:max-w-none md:grid-cols-2 xl:grid-cols-4 3xl:gap-6"
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} status={status} />
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-1 text-sm text-text-muted md:max-w-none">
        {rate !== null && (
          <p className="font-semibold text-text-body">{t("plans.rate", { price: formatPrice(lang, rate) })}</p>
        )}
        {pending && <Skeleton className="my-[0.15lh] h-[0.7lh] w-72 max-w-full rounded-sm" />}
        {status === "slow" && <p>{t("prices.slow")}</p>}
        <p>{t("plans.note")}</p>
      </div>
    </section>
  );
}
