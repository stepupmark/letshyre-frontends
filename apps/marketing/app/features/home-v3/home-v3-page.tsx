import { MotionProvider } from "./components/motion-provider"
import { Hero } from "./components/hero"

export function HomeV3Page() {
  return (
    <MotionProvider>
      <Hero />
    </MotionProvider>
  )
}
