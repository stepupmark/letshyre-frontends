import { useTranslation } from "@workspace/i18n/react"
import {
  BadgeCheck,
  FileText,
  LockOpen,
  type LucideIcon,
  ScrollText,
  Share2,
  UserPlus,
  Users,
} from "lucide-react"

import { wait } from "@/components/art/delay"
import { IconDot, Line, Tick } from "@/components/art/svg"

import type { ChapterId } from "../../lib/chapters"

const PATH =
  "M70 72 H410 C470 72 470 200 410 200 H150 C90 200 90 328 150 328 H300"

// delays follow the ink as it reaches each stop
const STOPS: {
  id: ChapterId
  x: number
  y: number
  icon: LucideIcon
  delay: number
}[] = [
  { id: "account", x: 70, y: 72, icon: UserPlus, delay: 300 },
  { id: "company", x: 230, y: 72, icon: BadgeCheck, delay: 640 },
  { id: "post", x: 390, y: 72, icon: FileText, delay: 970 },
  { id: "pool", x: 390, y: 200, icon: Users, delay: 1480 },
  { id: "unlock", x: 230, y: 200, icon: LockOpen, delay: 1810 },
  { id: "review", x: 150, y: 328, icon: ScrollText, delay: 2380 },
  { id: "team", x: 300, y: 328, icon: Share2, delay: 2700 },
]

/** The whole hiring journey as one route, ending at a shortlisted candidate. */
export function JourneyMap() {
  const { t } = useTranslation("employerGuide")

  return (
    <svg
      viewBox="0 0 520 400"
      aria-hidden="true"
      className="w-full overflow-visible"
    >
      <circle cx={270} cy={200} r={196} className="fill-brand/5" />

      <path
        d={PATH}
        strokeWidth={3}
        strokeLinecap="round"
        className="fill-none stroke-border"
      />
      <path
        d={PATH}
        pathLength={1}
        strokeWidth={3}
        strokeLinecap="round"
        className="ink fill-none stroke-brand"
        style={{
          ...wait(300),
          animationDuration: "2.4s",
          animationTimingFunction: "linear",
        }}
      />

      {STOPS.map((stop) => (
        <g key={stop.id} className="pop" style={wait(stop.delay)}>
          <circle
            cx={stop.x}
            cy={stop.y}
            r={24}
            className="fill-card stroke-border"
          />
          <IconDot cx={stop.x} cy={stop.y} r={17} icon={stop.icon} />
          <text
            x={stop.x}
            y={stop.y + 44}
            textAnchor="middle"
            fontSize={13}
            className="fill-muted-foreground font-medium"
          >
            {t(`map.${stop.id}`)}
          </text>
        </g>
      ))}

      <g className="rise" style={wait(2900)}>
        <rect
          x={340}
          y={290}
          width={170}
          height={76}
          rx={14}
          className="fill-card stroke-border"
        />
        <circle cx={368} cy={318} r={13} className="fill-brand-muted" />
        <Line x={390} y={310} width={70} strong />
        <Line x={390} y={325} width={96} />
        <rect
          x={356}
          y={344}
          width={64}
          height={10}
          rx={5}
          className="fill-muted"
        />
        <rect
          x={356}
          y={344}
          width={56}
          height={10}
          rx={5}
          className="bar-in fill-brand"
          style={wait(3100)}
        />
      </g>
      <Tick cx={502} cy={292} r={13} delay={3300} />
    </svg>
  )
}
