import { Briefcase, Camera, Mic, MonitorUp } from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"

export function PermissionsScreen() {
  return (
    <>
      {[Camera, Mic, MonitorUp].map((icon, i) => {
        const cy = 54 + i * 28
        return (
          <g key={cy}>
            <IconDot cx={36} cy={cy} r={10} icon={icon} />
            <Line x={54} y={cy - 3} width={i === 2 ? 84 : 64} />
            <rect
              x={176}
              y={cy - 8}
              width={32}
              height={16}
              rx={8}
              className="pop-in fill-primary"
            />
            <circle
              cx={200}
              cy={cy}
              r={5.5}
              className="fill-primary-foreground"
            />
          </g>
        )
      })}
    </>
  )
}

export function VerifyIdScreen() {
  return (
    <>
      <rect
        x={84}
        y={40}
        width={72}
        height={86}
        rx={10}
        className="fill-muted"
      />
      <circle cx={120} cy={72} r={14} className="fill-muted-foreground/25" />
      <path
        d="M96 126 C96 104 106 94 120 94 C134 94 144 104 144 126 Z"
        className="fill-muted-foreground/25"
      />
      <path
        d="M92 56 V48 H100 M140 48 H148 V56 M148 110 V118 H140 M100 118 H92 V110"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-none stroke-brand"
      />
      <rect
        x={90}
        y={82}
        width={60}
        height={2}
        rx={1}
        className="group-hover/step:scan fill-brand"
      />
      {[10, 20, 14, 24, 12].map((height, i) => (
        <rect
          key={i}
          x={174 + i * 8}
          y={92 - height / 2}
          width={4}
          height={height}
          rx={2}
          className="fill-brand/60"
        />
      ))}
      <Tick cx={156} cy={42} r={9} className="pop-in" />
    </>
  )
}

export function ChooseRoleScreen() {
  return (
    <>
      {[28, 124].map((x, i) => {
        const picked = i === 0
        return (
          <g key={x}>
            <rect
              x={x}
              y={44}
              width={88}
              height={76}
              rx={10}
              strokeWidth={picked ? 2 : 1}
              className={
                picked
                  ? "fill-brand-muted/50 stroke-primary"
                  : "fill-card stroke-border transition-colors duration-300 group-hover/step:stroke-brand/40"
              }
            />
            <IconDot cx={x + 20} cy={64} r={10} icon={Briefcase} />
            <circle
              cx={x + 72}
              cy={60}
              r={6}
              strokeWidth={1.5}
              className={
                picked ? "fill-none stroke-primary" : "fill-none stroke-border"
              }
            />
            {picked && (
              <circle
                cx={x + 72}
                cy={60}
                r={3}
                className="pop-in fill-primary"
              />
            )}
            <Line x={x + 12} y={88} width={picked ? 60 : 52} strong />
            <Line x={x + 12} y={102} width={40} />
          </g>
        )
      })}
    </>
  )
}

export function BeginScreen() {
  return (
    <>
      <rect
        x={22}
        y={44}
        width={128}
        height={78}
        rx={10}
        className="fill-brand-muted/50"
      />
      <Line x={34} y={56} width={84} strong />
      <Line x={34} y={72} width={104} />
      <rect
        x={34}
        y={88}
        width={104}
        height={24}
        rx={6}
        className="fill-background stroke-border"
      />
      <Line x={42} y={97} width={56} />
      <rect
        x={160}
        y={44}
        width={58}
        height={44}
        rx={8}
        className="fill-muted"
      />
      <circle cx={189} cy={62} r={8} className="fill-muted-foreground/25" />
      <path
        d="M175 88 C175 78 181 73 189 73 C197 73 203 78 203 88 Z"
        className="fill-muted-foreground/25"
      />
      <circle cx={168} cy={52} r={3} className="fill-destructive" />
      <circle
        cx={189}
        cy={108}
        r={12}
        strokeWidth={3}
        className="fill-none stroke-muted"
      />
      <circle
        cx={189}
        cy={108}
        r={12}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.65 1"
        transform="rotate(-90 189 108)"
        className="fill-none stroke-brand"
      />
    </>
  )
}
