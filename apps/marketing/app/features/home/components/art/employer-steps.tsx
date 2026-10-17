import { FileText, LockOpen, Mail, Phone, Play, Send } from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"

const CHIPS = [
  { y: 52, width: 62 },
  { y: 76, width: 48 },
  { y: 100, width: 70 },
  { y: 124, width: 54 },
]

export function PostScene() {
  return (
    <>
      <rect
        x={20}
        y={44}
        width={96}
        height={108}
        rx={6}
        className="fill-background stroke-border"
      />
      <Line x={30} y={56} width={52} strong />
      {[72, 84, 96, 108, 120, 132].map((y, i) => (
        <Line key={y} x={30} y={y} width={i % 2 ? 58 : 74} />
      ))}
      <path
        d="M124 98h14m-5-5 5 5-5 5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-none stroke-brand"
      />
      {CHIPS.map((chip) => (
        <g key={chip.y} className="pop-in">
          <rect
            x={146}
            y={chip.y}
            width={chip.width}
            height={16}
            rx={8}
            className="fill-brand-muted"
          />
          <circle cx={155} cy={chip.y + 8} r={3} className="fill-brand" />
          <Line
            x={162}
            y={chip.y + 5}
            width={chip.width - 24}
            className="fill-brand/40"
          />
        </g>
      ))}
    </>
  )
}

const RANKED = [
  { y: 58, match: 44 },
  { y: 94, match: 34 },
  { y: 130, match: 24 },
]

export function RankScene() {
  return (
    <>
      {RANKED.map((row, i) => (
        <g key={row.y} className="pop-in">
          <rect
            x={20}
            y={row.y - 14}
            width={200}
            height={28}
            rx={8}
            className={
              i === 0
                ? "fill-brand-muted stroke-brand/40"
                : "fill-background stroke-border"
            }
          />
          <text
            x={34}
            y={row.y + 4}
            textAnchor="middle"
            fontSize={11}
            className="fill-muted-foreground font-semibold"
          >
            {i + 1}
          </text>
          <circle cx={56} cy={row.y} r={8} className="fill-muted" />
          <Line x={70} y={row.y - 7} width={50} strong />
          <Line x={70} y={row.y + 2} width={34} />
          <rect
            x={146}
            y={row.y - 3}
            width={46}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={146}
            y={row.y - 3}
            width={row.match}
            height={6}
            rx={3}
            className="grow-in origin-left fill-brand transform-fill"
          />
          {i === 0 && <Tick cx={206} cy={row.y} r={7} className="pop-in" />}
        </g>
      ))}
    </>
  )
}

const EVIDENCE = [
  { y: 100, width: 112 },
  { y: 118, width: 98 },
  { y: 136, width: 90 },
]

export function ReviewScene() {
  return (
    <>
      <circle cx={38} cy={62} r={14} className="fill-brand-muted" />
      <Line x={60} y={54} width={60} strong />
      <Line x={60} y={66} width={40} />
      <circle
        cx={186}
        cy={66}
        r={22}
        strokeWidth={6}
        className="fill-none stroke-muted"
      />
      <path
        pathLength={1}
        d="M186 44A22 22 0 1 1 167.43 54.21"
        strokeWidth={6}
        strokeLinecap="round"
        className="draw-in fill-none stroke-brand"
      />
      <text
        x={186}
        y={71}
        textAnchor="middle"
        fontSize={14}
        className="fill-foreground font-semibold"
      >
        84
      </text>
      {EVIDENCE.map((row) => (
        <g key={row.y}>
          <Line x={20} y={row.y - 3} width={40} />
          <rect
            x={76}
            y={row.y - 3}
            width={124}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={76}
            y={row.y - 3}
            width={row.width}
            height={6}
            rx={3}
            className="grow-in origin-left fill-brand transform-fill"
          />
        </g>
      ))}
    </>
  )
}

const UNLOCKED = [
  { y: 100, width: 92, icon: FileText },
  { y: 120, width: 70, icon: Phone },
  { y: 140, width: 82, icon: Play },
]

export function UnlockScene() {
  return (
    <>
      <rect
        x={20}
        y={44}
        width={200}
        height={112}
        rx={8}
        className="fill-background stroke-border"
      />
      <circle cx={40} cy={64} r={10} className="fill-brand-muted" />
      <Line x={56} y={57} width={60} strong />
      <Line x={56} y={67} width={40} />
      <rect x={20} y={84} width={200} height={1} className="fill-border" />
      {UNLOCKED.map((row) => (
        <g key={row.y} className="pop-in">
          <IconDot cx={36} cy={row.y} r={8} icon={row.icon} />
          <Line x={52} y={row.y - 3} width={row.width} />
        </g>
      ))}
      <g className="pop-in">
        <circle cx={196} cy={64} r={12} className="fill-primary" />
        <LockOpen
          x={189}
          y={57}
          width={14}
          height={14}
          strokeWidth={2}
          className="text-primary-foreground"
        />
      </g>
    </>
  )
}

export function HireScene() {
  return (
    <>
      <rect
        x={20}
        y={44}
        width={120}
        height={108}
        rx={8}
        className="fill-background stroke-border"
      />
      <circle cx={80} cy={72} r={16} className="fill-brand-muted" />
      <Line x={52} y={96} width={56} strong />
      <Line x={60} y={108} width={40} />
      <g className="pop-in">
        <rect
          x={34}
          y={124}
          width={44}
          height={18}
          rx={9}
          className="fill-primary"
        />
        <Phone
          x={50}
          y={127}
          width={12}
          height={12}
          strokeWidth={2}
          className="text-primary-foreground"
        />
      </g>
      <rect
        x={84}
        y={124}
        width={44}
        height={18}
        rx={9}
        className="fill-muted"
      />
      <Mail
        x={100}
        y={127}
        width={12}
        height={12}
        strokeWidth={2}
        className="text-muted-foreground"
      />
      <path
        pathLength={1}
        d="M146 124C172 116 176 76 198 66"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="draw-in fill-none stroke-brand"
      />
      <g className="pop-in">
        <IconDot cx={208} cy={60} r={12} icon={Send} />
      </g>
    </>
  )
}
