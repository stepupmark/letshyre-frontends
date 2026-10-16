import type { ReactNode } from "react"

import { SketchWindow } from "@/components/art/sketch-window"

import type { ChapterId } from "../../lib/chapters"
import { PoolScene, ReviewScene, TeamScene, UnlockScene } from "./hiring-scenes"
import { AccountScene, CompanyScene, PostScene } from "./setup-scenes"

const SCENES: Record<ChapterId, () => ReactNode> = {
  account: AccountScene,
  company: CompanyScene,
  post: PostScene,
  pool: PoolScene,
  unlock: UnlockScene,
  review: ReviewScene,
  team: TeamScene,
}

/** What the dashboard shows at each chapter. */
export function Scene({ chapter }: { chapter: ChapterId }) {
  const Content = SCENES[chapter]
  return (
    <SketchWindow>
      <Content />
    </SketchWindow>
  )
}
