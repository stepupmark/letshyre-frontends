import { Faq } from "./components/faq"
import { FinalCta } from "./components/final-cta"
import { Hero } from "./components/hero"
import { Journey } from "./components/journey"
import { MotionProvider } from "./components/motion-provider"
import { Pricing } from "./components/pricing"
import { Professionals } from "./components/professionals"
import { Proof } from "./components/proof"
import { StickyCtas } from "./components/sticky-ctas"

export function HomePage() {
  return (
    <MotionProvider>
      <Hero />
      <Proof />
      <Journey />
      <Professionals />
      <Pricing />
      <Faq />
      <FinalCta />
      <StickyCtas />
    </MotionProvider>
  )
}
