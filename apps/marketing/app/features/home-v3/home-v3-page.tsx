import { Faq } from "./components/faq"
import { FinalCta } from "./components/final-cta"
import { Hero } from "./components/hero"
import { Interview } from "./components/interview"
import { Journey } from "./components/journey"
import { MotionProvider } from "./components/motion-provider"
import { Pricing } from "./components/pricing"
import { Professionals } from "./components/professionals"
import { Proof } from "./components/proof"

export function HomeV3Page() {
  return (
    <MotionProvider>
      <Hero />
      <Proof />
      <Interview />
      <Journey />
      <Professionals />
      <Pricing />
      <Faq />
      <FinalCta />
    </MotionProvider>
  )
}
