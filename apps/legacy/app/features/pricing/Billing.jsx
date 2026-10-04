import { useTranslation } from "react-i18next";
import { PlanGrid } from "@/features/pricing/components/PlanGrid";
import { TopUpPacks } from "@/features/pricing/components/TopUpPacks";
import { CheckoutDialog } from "@/features/pricing/components/checkout/CheckoutDialog";

// Buying inside the dashboard. The marketing site links here with ?checkout=<key>.
export function Billing() {
  const { t } = useTranslation("employer");

  return (
    <div className="font-ui">
      <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700">{t("invoice.buyCredits")}</h1>
      <p className="mt-2 text-sm leading-normal text-neutral-500">{t("dashboard.credits.blurb")}</p>
      <PlanGrid />
      <TopUpPacks />
      <CheckoutDialog />
    </div>
  );
}
