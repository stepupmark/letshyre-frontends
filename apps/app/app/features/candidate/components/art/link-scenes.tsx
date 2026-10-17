import type { ReactNode } from "react"

import type { ShareProblem } from "../../types"

function Card({ children }: { children: ReactNode }) {
  return (
    <>
      <rect
        x={20}
        y={14}
        width={80}
        height={68}
        rx={10}
        className="fill-card stroke-border"
      />
      <circle cx={36} cy={32} r={7} className="fill-muted" />
      <rect
        x={48}
        y={27}
        width={36}
        height={5}
        rx={2.5}
        className="fill-muted-foreground/30"
      />
      <rect
        x={48}
        y={35}
        width={24}
        height={4}
        rx={2}
        className="fill-muted-foreground/20"
      />
      <rect x={30} y={50} width={60} height={4} rx={2} className="fill-muted" />
      <rect x={30} y={60} width={44} height={4} rx={2} className="fill-muted" />
      <g className="pop" style={{ animationDelay: "200ms" }}>
        {children}
      </g>
    </>
  )
}

const BADGE = "fill-background stroke-brand"

const SCENES: Record<ShareProblem, ReactNode> = {
  invalid: (
    <Card>
      <circle cx={92} cy={74} r={16} className={BADGE} strokeWidth={1.5} />
      <path
        d="M85 77l-2 2a3.5 3.5 0 0 1-5-5l2-2m11-4 2-2a3.5 3.5 0 0 1 5 5l-2 2m-9 1 2-2"
        className="fill-none stroke-brand-text"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Card>
  ),
  expired: (
    <Card>
      <circle cx={92} cy={74} r={16} className={BADGE} strokeWidth={1.5} />
      <path
        d="M86 66h12M86 82h12M87 66c0 5 10 6 10 8s-10 3-10 8M97 66c0 5-10 6-10 8s10 3 10 8"
        className="fill-none stroke-brand-text"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Card>
  ),
  limit: (
    <Card>
      <circle cx={92} cy={74} r={16} className={BADGE} strokeWidth={1.5} />
      <path
        d="M83 74s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5ZM84 66l16 16"
        className="fill-none stroke-brand-text"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Card>
  ),
  unavailable: (
    <Card>
      <circle cx={92} cy={74} r={16} className={BADGE} strokeWidth={1.5} />
      <path
        d="M92 67v8m0 4v.5"
        className="fill-none stroke-brand-text"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Card>
  ),
}

export function LinkScene({ problem }: { problem: ShareProblem }) {
  return (
    <svg viewBox="0 0 120 96" aria-hidden className="h-24 w-30">
      {SCENES[problem]}
    </svg>
  )
}
