import { type MotionValue, motionValue } from "motion/react"
import { createContext, use } from "react"

interface Scene {
  progress: MotionValue<number>
  still: boolean
}

export const settled = motionValue(1)

export const SceneContext = createContext<Scene>({
  progress: settled,
  still: true,
})

export function useScene() {
  return use(SceneContext)
}
