import { Hero } from "./components/hero"
import { Journey } from "./components/journey"
import { MotionProvider } from "./components/motion-provider"
import { Proof } from "./components/proof"

export function HomeV3Page() {
  return (
    <MotionProvider>
      <Hero />
      <Proof />
      <Journey />
    </MotionProvider>
  )
}
