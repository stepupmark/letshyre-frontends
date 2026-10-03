import { FinalCta } from "./components/final-cta"
import { ForCandidates } from "./components/for-candidates"
import { Hero } from "./components/hero"
import { HomeFaq } from "./components/home-faq"
import { HowItWorks } from "./components/how-it-works"
import { PricingTeaser } from "./components/pricing-teaser"

export function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ForCandidates />
      <PricingTeaser />
      <HomeFaq />
      <FinalCta />
    </>
  )
}
