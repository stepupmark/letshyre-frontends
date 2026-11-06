import type { ReactNode } from "react"

import { SketchWindow } from "@/components/art/sketch-window"

import type { ChapterId } from "../../lib/chapters"
import { PoolScene, UnlockScene } from "./hiring-scenes"
import { ReviewScene, TeamScene } from "./review-scenes"
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
