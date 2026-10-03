import { PlanComparisonTable } from "./components/plan-comparison-table"
import { PlanGrid } from "./components/plan-grid"
import { PricingCta } from "./components/pricing-cta"
import { PricingFaq } from "./components/pricing-faq"
import { PricingHero } from "./components/pricing-hero"
import { TopUpPacks } from "./components/top-up-packs"

export function PricingPage() {
  return (
    <>
      <PricingHero />
      <PlanGrid />
      <PlanComparisonTable />
      <TopUpPacks />
      <PricingFaq />
      <PricingCta />
    </>
  )
}
