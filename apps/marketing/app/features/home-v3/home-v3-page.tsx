import { CandidateFile } from "./components/candidate-file"
import { FactsTicker } from "./components/facts-ticker"
import { Hero } from "./components/hero"
import { Journey } from "./components/journey"
import { MotionProvider } from "./components/motion-provider"
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
    </MotionProvider>
  )
}
