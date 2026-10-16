import type { ReactNode } from "react"

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

/** What the dashboard shows at each chapter, sketched inside a browser window. */
export function Scene({ chapter }: { chapter: ChapterId }) {
  const Content = SCENES[chapter]
  return (
    <svg viewBox="0 0 240 170" aria-hidden="true" className="w-full">
      <rect
        x={6}
        y={6}
        width={228}
        height={158}
        rx={12}
        className="fill-card stroke-border"
      />
      {[20, 30, 40].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={19}
          r={3}
          className="fill-muted-foreground/25"
        />
      ))}
      <rect x={6} y={32} width={228} height={1} className="fill-border" />
      <Content />
    </svg>
  )
}
