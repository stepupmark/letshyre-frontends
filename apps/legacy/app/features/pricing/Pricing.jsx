import { useEffect } from "react";
import { trackEvent } from "@/lib/metaPixel";
import { PricingHero } from "@/features/pricing/components/PricingHero";
import { PlanGrid } from "@/features/pricing/components/PlanGrid";
import { PlanComparison } from "@/features/pricing/components/PlanComparison";
import { TopUpPacks } from "@/features/pricing/components/TopUpPacks";
import { PricingFaq } from "@/features/pricing/components/PricingFaq";
import { PricingCta } from "@/features/pricing/components/PricingCta";
import { CheckoutDialog } from "@/features/pricing/components/checkout/CheckoutDialog";

export function Pricing() {
  useEffect(() => {
    trackEvent("ViewContent", { content_name: "Pricing" });
  }, []);

  return (
    <div className="flex grow flex-col bg-bg-card text-text-body">
      <PricingHero />
      <PlanGrid />
      <PlanComparison />
      <TopUpPacks />
      <PricingFaq />
      <PricingCta />
      <CheckoutDialog />
    </div>
  );
}
