import { useTranslation } from "@workspace/i18n/react"
import {
  BadgeCheck,
  Briefcase,
  FileStack,
  type LucideIcon,
  MonitorDown,
  ShieldCheck,
  UserPlus,
  UserRound,
  Video,
} from "lucide-react"

import { wait } from "@/components/art/delay"
import { IconDot, Line, Tick } from "@/components/art/svg"

import type { ChapterId } from "../../lib/chapters"

const PATH =
  "M70 72 H410 C470 72 470 200 410 200 H110 C50 200 50 328 110 328 H270"

// delays follow the ink as it reaches each stop
const STOPS: {
  id: ChapterId
  x: number
  y: number
  icon: LucideIcon
  delay: number
}[] = [
  { id: "account", x: 70, y: 72, icon: UserPlus, delay: 300 },
  { id: "profile", x: 230, y: 72, icon: UserRound, delay: 630 },
  { id: "documents", x: 390, y: 72, icon: FileStack, delay: 960 },
  { id: "app", x: 390, y: 200, icon: MonitorDown, delay: 1400 },
  { id: "checks", x: 250, y: 200, icon: ShieldCheck, delay: 1690 },
  { id: "role", x: 110, y: 200, icon: Briefcase, delay: 1980 },
  { id: "interview", x: 110, y: 328, icon: Video, delay: 2370 },
  { id: "after", x: 270, y: 328, icon: BadgeCheck, delay: 2700 },
]

/** The candidate journey as one route, ending at a scorecard an employer has unlocked. */
export function JourneyMap() {
  const { t } = useTranslation("candidateGuide")

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
          x={330}
          y={288}
          width={176}
          height={80}
          rx={14}
          className="fill-card stroke-border"
        />
        <circle cx={360} cy={316} r={14} className="fill-brand-muted" />
        <Line x={384} y={308} width={64} strong />
        <Line x={384} y={323} width={90} />
        <circle
          cx={476}
          cy={316}
          r={14}
          strokeWidth={4}
          className="fill-none stroke-muted"
        />
        <circle
          cx={476}
          cy={316}
          r={14}
          strokeWidth={4}
          pathLength={1}
          strokeLinecap="round"
          className="ink fill-none stroke-brand"
          style={{ ...wait(3100), strokeDasharray: "0.82 2" }}
          transform="rotate(-90 476 316)"
        />
        <rect
          x={346}
          y={344}
          width={70}
          height={12}
          rx={6}
          className="fill-success-muted"
        />
        <Line x={354} y={347} width={44} className="fill-success/70" />
      </g>
      <Tick cx={500} cy={290} r={13} delay={3300} />
    </svg>
  )
}
