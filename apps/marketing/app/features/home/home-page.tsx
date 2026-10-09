import { Evidence } from "./components/evidence"
import { FinalCta } from "./components/final-cta"
import { ForProfessionals } from "./components/for-professionals"
import { FreshPool } from "./components/fresh-pool"
import { Hero } from "./components/hero"
import { HomeFaq } from "./components/home-faq"
import { HowItWorks } from "./components/how-it-works"
import { PricingNote } from "./components/pricing-note"
import { Tension } from "./components/tension"

export function HomePage() {
  return (
    <>
      <Hero />
      <Tension />
      <HowItWorks />
      <Evidence />
      <ForProfessionals />
      <FreshPool />
      <PricingNote />
      <HomeFaq />
      <FinalCta />
    </>
  )
}
