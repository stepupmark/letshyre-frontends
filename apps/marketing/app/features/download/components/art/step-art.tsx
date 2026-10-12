import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, FileDown, MousePointer2 } from "lucide-react"

import { Line, Tick } from "@/components/art/svg"

export type StepId = "download" | "install" | "interview"

const VIEW = "0 0 240 140"

export function StepArt({ step, active }: { step: StepId; active: boolean }) {
  if (step === "download") return <Download done={active} />
  if (step === "install") return <Install running={active} />
  return <Interview />
}

function Download({ done }: { done: boolean }) {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full">
      <g className="transition-[translate] duration-300 ease-out group-hover/step:translate-y-1.5 motion-reduce:transition-none">
        <circle cx={120} cy={40} r={18} className="fill-primary" />
        <ArrowDown
          x={110}
          y={30}
          width={20}
          height={20}
          strokeWidth={2.5}
          className="text-primary-foreground"
        />
      </g>
      <rect
        x={40}
        y={78}
        width={160}
        height={44}
        rx={12}
        className="fill-card stroke-border"
      />
      <rect
        x={54}
        y={88}
        width={24}
        height={24}
        rx={6}
        className="fill-brand-muted"
      />
      <FileDown
        x={58}
        y={92}
        width={16}
        height={16}
        strokeWidth={2}
        className="text-brand-text"
      />
      <Line x={88} y={92} width={64} strong />
      <Line x={88} y={106} width={44} />
      {done ? (
        <Tick cx={180} cy={100} r={10} />
      ) : (
        <>
          <circle
            cx={180}
            cy={100}
            r={9}
            strokeWidth={3}
            className="fill-none stroke-muted"
          />
          <circle
            cx={180}
            cy={100}
            r={9}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.35 1"
            transform="rotate(-90 180 100)"
            className="fill-none stroke-brand"
          />
        </>
      )}
    </svg>
  )
}

function Install({ running }: { running: boolean }) {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full">
      <rect
        x={44}
        y={18}
        width={152}
        height={106}
        rx={12}
        className="fill-card stroke-border"
      />
      {[58, 68, 78].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={31}
          r={3}
          className="fill-muted-foreground/25"
        />
      ))}
      <rect
        x={60}
        y={48}
        width={28}
        height={28}
        rx={8}
        className="fill-primary"
      />
      <Line x={98} y={52} width={72} strong />
      <Line x={98} y={66} width={52} />
      <rect
        x={60}
        y={94}
        width={120}
        height={8}
        rx={4}
        className="fill-muted"
      />
      <rect
        x={60}
        y={94}
        width={120}
        height={8}
        rx={4}
        className={cn(
          "origin-left fill-brand transition-[scale] ease-out transform-fill motion-reduce:transition-none",
          running
            ? "scale-x-100 duration-2400"
            : "scale-x-30 duration-500 group-hover/step:scale-x-50"
        )}
      />
    </svg>
  )
}

function Interview() {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full">
      <rect
        x={56}
        y={12}
        width={128}
        height={116}
        rx={12}
        className="fill-card stroke-border"
      />
      <circle cx={120} cy={36} r={10} className="fill-brand-muted" />
      <rect
        x={72}
        y={56}
        width={96}
        height={12}
        rx={4}
        className="fill-muted"
      />
      <rect
        x={72}
        y={74}
        width={96}
        height={12}
        rx={4}
        className="fill-muted"
      />
      <rect
        x={72}
        y={98}
        width={96}
        height={16}
        rx={8}
        className="fill-primary transition-opacity duration-300 group-hover/step:opacity-85"
      />
      <MousePointer2
        x={152}
        y={106}
        width={20}
        height={20}
        strokeWidth={1.75}
        className="fill-card text-foreground transition-[translate] duration-300 ease-out group-hover/step:-translate-x-4 group-hover/step:-translate-y-2 motion-reduce:transition-none"
      />
    </svg>
  )
}
