import {
  Bot,
  Download,
  Globe,
  type LucideIcon,
  MousePointer2,
  Video,
  X,
} from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"

export function DownloadScreen() {
  return (
    <>
      <g className="transition-[translate] duration-300 ease-out group-hover/step:translate-y-1 motion-reduce:transition-none">
        <rect
          x={36}
          y={48}
          width={40}
          height={40}
          rx={10}
          className="fill-primary"
        />
        <Download
          x={46}
          y={58}
          width={20}
          height={20}
          strokeWidth={2.5}
          className="text-primary-foreground"
        />
      </g>
      <Line x={88} y={56} width={96} strong />
      <Line x={88} y={72} width={64} />
      <rect
        x={36}
        y={106}
        width={168}
        height={8}
        rx={4}
        className="fill-muted"
      />
      <rect
        x={36}
        y={106}
        width={168}
        height={8}
        rx={4}
        className="grow-in origin-left fill-brand transform-fill"
      />
    </>
  )
}

export function SignInScreen() {
  return (
    <>
      {[44, 72].map((y) => (
        <rect
          key={y}
          x={48}
          y={y}
          width={144}
          height={22}
          rx={6}
          className="fill-background stroke-border"
        />
      ))}
      <Line x={58} y={52} width={68} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          key={i}
          cx={62 + i * 10}
          cy={83}
          r={2.5}
          className="fill-foreground/45"
        />
      ))}
      <rect
        x={48}
        y={104}
        width={144}
        height={22}
        rx={11}
        className="fill-primary transition-opacity duration-300 group-hover/step:opacity-85"
      />
      <Line x={100} y={112} width={40} className="fill-primary-foreground/80" />
      <MousePointer2
        x={176}
        y={114}
        width={18}
        height={18}
        strokeWidth={1.75}
        className="fill-card text-foreground transition-[translate] duration-300 ease-out group-hover/step:-translate-x-5 group-hover/step:-translate-y-1 motion-reduce:transition-none"
      />
    </>
  )
}

export function DashboardScreen() {
  return (
    <>
      <circle cx={46} cy={64} r={16} className="fill-brand-muted" />
      <Line x={26} y={90} width={40} strong />
      <Line x={26} y={102} width={30} />
      {[44, 86].map((y, i) => (
        <g key={y}>
          <rect
            x={84}
            y={y}
            width={136}
            height={34}
            rx={8}
            className="fill-muted/60"
          />
          <Line x={94} y={y + 9} width={52} strong />
          <Line x={94} y={y + 21} width={36} />
          <rect
            x={164}
            y={y + 8}
            width={46}
            height={18}
            rx={9}
            className={
              i === 0 ? "pop-in fill-primary" : "fill-background stroke-border"
            }
          />
        </g>
      ))}
    </>
  )
}

const APPS: { icon: LucideIcon; closed: boolean }[] = [
  { icon: Globe, closed: true },
  { icon: Video, closed: true },
  { icon: Bot, closed: false },
]

export function ClearEnvScreen() {
  return (
    <>
      {APPS.map(({ icon, closed }, i) => {
        const cy = 54 + i * 28
        return (
          <g key={cy}>
            <IconDot cx={36} cy={cy} r={10} icon={icon} />
            <Line x={54} y={cy - 3} width={i === 1 ? 72 : 96} />
            {closed ? (
              <Tick cx={196} cy={cy} r={9} className="pop-in" />
            ) : (
              <g>
                <rect
                  x={170}
                  y={cy - 9}
                  width={44}
                  height={18}
                  rx={9}
                  className="fill-destructive/15 transition-colors duration-300 group-hover/step:fill-destructive/25"
                />
                <X
                  x={185}
                  y={cy - 7}
                  width={14}
                  height={14}
                  strokeWidth={2.5}
                  className="text-destructive"
                />
              </g>
            )}
          </g>
        )
      })}
    </>
  )
}
