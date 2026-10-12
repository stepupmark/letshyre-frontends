import { Plus } from "lucide-react"

import { Line } from "@/components/art/svg"

export type ReasonId =
  "aiPowered" | "faster" | "network" | "payPerUnlock" | "transparency"

const VIEW = "0 0 96 56"
const WAVE = [10, 22, 14, 28, 18, 24, 12]

/** A small drawing per reason; each one moves a little when its card is hovered. */
export function WhyArt({ id }: { id: ReasonId }) {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="h-14 w-24">
      {id === "aiPowered" && <Wave />}
      {id === "faster" && <Stopwatch />}
      {id === "network" && <People />}
      {id === "payPerUnlock" && <Padlock />}
      {id === "transparency" && <Scorecard />}
    </svg>
  )
}

function Wave() {
  return (
    <>
      <rect
        x={2}
        y={6}
        width={92}
        height={44}
        rx={12}
        className="fill-brand-muted"
      />
      {WAVE.map((height, i) => (
        <rect
          key={i}
          x={18 + i * 9}
          y={28 - height / 2}
          width={5}
          height={height}
          rx={2.5}
          className="origin-center fill-brand transition-[scale] duration-300 ease-out transform-fill group-hover/reason:scale-y-60 even:group-hover/reason:scale-y-125 motion-reduce:transition-none"
        />
      ))}
    </>
  )
}

function Stopwatch() {
  return (
    <>
      <rect
        x={42}
        y={2}
        width={12}
        height={6}
        rx={2}
        className="fill-foreground/25"
      />
      <circle
        cx={48}
        cy={31}
        r={22}
        strokeWidth={3}
        className="fill-brand-muted stroke-brand"
      />
      <path
        d="M48 31 V16"
        strokeWidth={3}
        strokeLinecap="round"
        className="origin-[48px_31px] stroke-foreground/70 transition-[rotate] duration-700 ease-out group-hover/reason:rotate-100 motion-reduce:transition-none"
      />
      <circle cx={48} cy={31} r={3} className="fill-foreground/70" />
    </>
  )
}

function People() {
  return (
    <>
      <circle
        cx={24}
        cy={28}
        r={14}
        strokeWidth={3}
        className="fill-brand-muted stroke-card transition-[translate] duration-300 ease-out group-hover/reason:-translate-x-1.5 motion-reduce:transition-none"
      />
      <circle
        cx={42}
        cy={28}
        r={14}
        strokeWidth={3}
        className="fill-brand/60 stroke-card transition-[translate] duration-300 ease-out group-hover/reason:-translate-x-0.5 motion-reduce:transition-none"
      />
      <circle
        cx={60}
        cy={28}
        r={14}
        strokeWidth={3}
        className="fill-brand stroke-card transition-[translate] duration-300 ease-out group-hover/reason:translate-x-0.5 motion-reduce:transition-none"
      />
      <g className="transition-[translate] duration-300 ease-out group-hover/reason:translate-x-1.5 motion-reduce:transition-none">
        <circle
          cx={78}
          cy={28}
          r={14}
          strokeWidth={3}
          className="fill-primary stroke-card"
        />
        <Plus
          x={71}
          y={21}
          width={14}
          height={14}
          strokeWidth={2.5}
          className="text-primary-foreground"
        />
      </g>
    </>
  )
}

function Padlock() {
  return (
    <>
      <path
        d="M38 28 V20 A10 10 0 0 1 58 20 V28"
        strokeWidth={4}
        strokeLinecap="round"
        className="fill-none stroke-foreground/40 transition-[translate] duration-300 ease-out group-hover/reason:-translate-y-1.5 motion-reduce:transition-none"
      />
      <rect
        x={30}
        y={26}
        width={36}
        height={28}
        rx={7}
        className="fill-brand"
      />
      <circle cx={48} cy={38} r={3.5} className="fill-primary-foreground" />
      <rect
        x={46.5}
        y={39}
        width={3}
        height={8}
        rx={1.5}
        className="fill-primary-foreground"
      />
    </>
  )
}

function Scorecard() {
  return (
    <>
      <rect
        x={6}
        y={2}
        width={84}
        height={52}
        rx={10}
        className="fill-card stroke-border"
      />
      <Line x={16} y={11} width={36} strong />
      {[0.7, 0.9, 0.55].map((score, i) => (
        <g key={score}>
          <rect
            x={16}
            y={24 + i * 9}
            width={64}
            height={5}
            rx={2.5}
            className="fill-muted"
          />
          <rect
            x={16}
            y={24 + i * 9}
            width={64 * score}
            height={5}
            rx={2.5}
            className="origin-left fill-brand transition-[scale] duration-500 ease-out transform-fill group-hover/reason:scale-x-110 motion-reduce:transition-none"
          />
        </g>
      ))}
    </>
  )
}
