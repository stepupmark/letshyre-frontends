import { FinalCta } from "./components/final-cta"
import { HomeFaq } from "./components/home-faq"
import { Evidence } from "./components/v2/evidence"
import { ForProfessionals } from "./components/v2/for-professionals"
import { Hero } from "./components/v2/hero"
import { HowItWorks } from "./components/v2/how-it-works"
import { Pricing } from "./components/v2/pricing"
import { Problem } from "./components/v2/problem"

export function HomeV2Page() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Evidence />
      <ForProfessionals />
      <Pricing />
      <HomeFaq />
      <FinalCta />
    </>
  )
}
