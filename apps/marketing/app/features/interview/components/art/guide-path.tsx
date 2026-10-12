import { Download, type LucideIcon, Play, ShieldCheck } from "lucide-react"

import { wait } from "@/components/art/delay"
import { Line, Tick } from "@/components/art/svg"

const PATH =
  "M60 72 H340 C400 72 400 196 340 196 H180 C120 196 120 320 180 320 H268"
const LEVELS = [8, 16, 11, 19, 9]

/** The three phases as one route, drawn once, ending at the first question. */
export function GuidePath() {
  return (
    <svg
      viewBox="0 0 520 400"
      aria-hidden="true"
      className="w-full overflow-visible"
    >
      <circle cx={260} cy={200} r={196} className="fill-brand/5" />

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

      <SubSteps x={40} y={100} delay={500} />
      <SubSteps x={176} y={226} delay={1700} />

      <Milestone cx={60} cy={72} icon={Download} delay={300} />
      <Milestone cx={340} cy={196} icon={ShieldCheck} delay={1550} />
      <Milestone cx={180} cy={320} icon={Play} delay={2500} />

      <g className="rise" style={wait(2700)}>
        <rect
          x={268}
          y={292}
          width={240}
          height={96}
          rx={16}
          className="fill-card stroke-border drop-shadow-[0_16px_40px_rgb(15_23_42/0.1)]"
        />
        <Line x={288} y={310} width={120} strong />
        <Line x={288} y={328} width={180} />
        <Line x={288} y={342} width={136} />
        <circle
          cx={482}
          cy={316}
          r={11}
          strokeWidth={3}
          className="fill-none stroke-muted"
        />
        <circle
          cx={482}
          cy={316}
          r={11}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.7 1"
          transform="rotate(-90 482 316)"
          className="fill-none stroke-brand"
        />
        <circle cx={292} cy={368} r={4} className="fill-destructive" />
        {LEVELS.map((height, i) => (
          <rect
            key={i}
            x={304 + i * 7}
            y={372 - height}
            width={3.5}
            height={height}
            rx={1.75}
            className="level fill-brand"
            style={wait(3000 + i * 120)}
          />
        ))}
      </g>
    </svg>
  )
}

function Milestone({
  cx,
  cy,
  icon: Icon,
  delay,
}: {
  cx: number
  cy: number
  icon: LucideIcon
  delay: number
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={22}
        strokeWidth={2}
        className="fill-card stroke-border"
      />
      <Icon
        x={cx - 10}
        y={cy - 10}
        width={20}
        height={20}
        strokeWidth={2}
        className="text-muted-foreground"
      />
      <g className="pop" style={wait(delay)}>
        <circle cx={cx} cy={cy} r={22} className="fill-primary" />
        <Icon
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          strokeWidth={2}
          className="text-primary-foreground"
        />
      </g>
    </g>
  )
}

function SubSteps({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g className="rise" style={wait(delay - 200)}>
      <rect
        x={x}
        y={y}
        width={160}
        height={56}
        rx={12}
        className="fill-card stroke-border"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle
            cx={x + 18}
            cy={y + 14 + i * 14}
            r={6}
            strokeWidth={1.5}
            className="fill-none stroke-border"
          />
          <Tick
            cx={x + 18}
            cy={y + 14 + i * 14}
            r={6}
            delay={delay + i * 150}
          />
          <Line x={x + 32} y={y + 11 + i * 14} width={i === 1 ? 76 : 100} />
        </g>
      ))}
    </g>
  )
}
