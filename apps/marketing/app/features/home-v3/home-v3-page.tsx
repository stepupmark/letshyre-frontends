import { CandidateFile } from "./components/candidate-file"
import { FactsTicker } from "./components/facts-ticker"
import { Faq } from "./components/faq"
import { FinalCta } from "./components/final-cta"
import { Hero } from "./components/hero"
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
      <Journey />
      <CandidateFile />
      <FactsTicker />
      <Professionals />
      <Pricing />
      <Faq />
      <FinalCta />
    </MotionProvider>
  )
}
