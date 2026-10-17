import type { ReactNode } from "react"

export type ChapterId =
  | "match"
  | "communication"
  | "types"
  | "insights"
  | "recording"
  | "profile"
  | "answers"

const WAVE = [6, 11, 16, 9, 13, 7, 4]

const GLYPHS: Record<ChapterId, ReactNode> = {
  match: (
    <>
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={5} className="fill-brand/20" />
      <circle cx={12} cy={12} r={1.5} className="pop fill-brand" />
    </>
  ),
  communication: WAVE.map((h, i) => (
    <line
      key={i}
      x1={4 + i * 2.67}
      x2={4 + i * 2.67}
      y1={12 - h / 2}
      y2={12 + h / 2}
      className="grow-up"
      style={{ animationDelay: `${i * 40}ms` }}
    />
  )),
  types: (
    <>
      <rect
        x={3}
        y={13}
        width={4}
        height={8}
        rx={1}
        className="fill-brand/20"
      />
      <rect x={10} y={7} width={4} height={14} rx={1} />
      <rect
        x={17}
        y={3}
        width={4}
        height={18}
        rx={1}
        className="fill-brand/20"
      />
    </>
  ),
  insights: (
    <>
      <path d="m3 9 3 3 6-6" />
      <path d="M14 21V13h6l-1.5 2.5L20 18h-6" className="fill-brand/20" />
      <path d="M3 17h7" />
    </>
  ),
  recording: (
    <>
      <rect x={2.5} y={5} width={19} height={14} rx={3} />
      <path d="m10 9.5 4.5 2.5-4.5 2.5z" className="fill-brand/20" />
    </>
  ),
  profile: (
    <>
      <rect x={2.5} y={4.5} width={19} height={15} rx={3} />
      <circle cx={8.5} cy={11} r={2.5} className="fill-brand/20" />
      <path d="M5.5 16.5a3.5 3 0 0 1 6 0M14 10h4.5M14 14h3" />
    </>
  ),
  answers: (
    <>
      <path
        d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z"
        className="fill-brand/10"
      />
      <path d="M7 10h10M7 13h6" />
    </>
  ),
}

export function ChapterGlyph({ id }: { id: ChapterId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 stroke-brand-text"
    >
      {GLYPHS[id]}
    </svg>
  )
}
