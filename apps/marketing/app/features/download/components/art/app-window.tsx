import { Camera, Mic, MonitorUp, ShieldCheck } from "lucide-react"

import { wait } from "./delay"
import { IconDot, Line, Tick } from "./svg"

const CHECKS = [Camera, Mic, MonitorUp, ShieldCheck]
const LEVELS = [10, 20, 14, 24, 12]

/** The desktop app: the candidate on camera, the question, and the pre-start checks ticking off. */
export function AppWindow() {
  return (
    <svg
      viewBox="0 0 520 400"
      aria-hidden="true"
      className="w-full overflow-visible"
    >
      <circle cx={260} cy={200} r={196} className="fill-brand/5" />

      <g className="rise">
        <rect
          x={16}
          y={24}
          width={488}
          height={336}
          rx={20}
          className="fill-card stroke-border drop-shadow-[0_16px_40px_rgb(15_23_42/0.08)]"
        />
        {[44, 60, 76].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={44}
            r={4}
            className="fill-muted-foreground/25"
          />
        ))}
        <rect
          x={210}
          y={39}
          width={100}
          height={10}
          rx={5}
          className="fill-muted"
        />
        <rect x={16} y={64} width={488} height={1} className="fill-border" />
      </g>

      <g className="rise" style={wait(150)}>
        <rect
          x={40}
          y={88}
          width={264}
          height={176}
          rx={14}
          className="fill-muted"
        />
        <circle cx={172} cy={158} r={30} className="fill-muted-foreground/20" />
        <path
          d="M108 264 C108 222 138 202 172 202 C206 202 236 222 236 264 Z"
          className="fill-muted-foreground/20"
        />
        <circle cx={60} cy={108} r={4.5} className="fill-destructive" />
        <Line x={72} y={105} width={34} />
        {LEVELS.map((height, i) => (
          <rect
            key={i}
            x={256 + i * 8}
            y={250 - height}
            width={4}
            height={height}
            rx={2}
            className="level fill-brand"
            style={wait(600 + i * 120)}
          />
        ))}
      </g>

      <g className="rise" style={wait(250)}>
        <rect
          x={40}
          y={280}
          width={264}
          height={56}
          rx={12}
          className="fill-brand-muted/60"
        />
        <Line x={58} y={297} width={170} strong />
        <Line x={58} y={315} width={214} />
      </g>

      <g className="rise" style={wait(350)}>
        <rect
          x={320}
          y={88}
          width={160}
          height={248}
          rx={14}
          className="fill-background stroke-border"
        />
        <Line x={336} y={106} width={78} strong />
        {CHECKS.map((icon, i) => {
          const cy = 144 + i * 40
          return (
            <g key={i}>
              <IconDot cx={350} cy={cy} r={13} icon={icon} />
              <Line x={372} y={cy - 3} width={i % 2 ? 48 : 60} />
              <circle
                cx={460}
                cy={cy}
                r={9}
                strokeWidth={1.5}
                className="fill-none stroke-border"
              />
              <Tick cx={460} cy={cy} r={9} delay={800 + i * 300} />
            </g>
          )
        })}
        <g className="rise" style={wait(2100)}>
          <rect
            x={336}
            y={300}
            width={128}
            height={24}
            rx={12}
            className="fill-primary"
          />
          <rect
            x={376}
            y={309}
            width={48}
            height={6}
            rx={3}
            className="fill-primary-foreground/80"
          />
        </g>
      </g>

      <g className="pop" style={wait(2300)}>
        <g className="float" style={wait(2600)}>
          <circle cx={484} cy={40} r={26} className="fill-primary" />
          <ShieldCheck
            x={472}
            y={28}
            width={24}
            height={24}
            strokeWidth={2}
            className="text-primary-foreground"
          />
        </g>
      </g>

      <g className="rise" style={wait(2400)}>
        <rect
          x={0}
          y={326}
          width={168}
          height={48}
          rx={24}
          className="fill-card stroke-border drop-shadow-[0_8px_20px_rgb(15_23_42/0.08)]"
        />
        <Tick cx={26} cy={350} r={11} delay={2600} />
        <Line x={46} y={340} width={92} strong />
        <Line x={46} y={354} width={64} />
      </g>
    </svg>
  )
}
