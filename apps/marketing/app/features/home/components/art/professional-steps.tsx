import { Briefcase, Camera, FileUp, ScanSearch } from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"

const FIELDS = [
  { y: 46, fill: 70 },
  { y: 72, fill: 56 },
  { y: 98, fill: 84 },
  { y: 124, fill: 40 },
]

export function ProfileScene() {
  return (
    <>
      <circle cx={52} cy={84} r={26} className="fill-brand-muted" />
      <circle cx={52} cy={78} r={9} className="fill-brand/40" />
      <path d="M36 101a16 13 0 0 1 32 0z" className="fill-brand/40" />
      <g className="pop-in">
        <circle cx={72} cy={104} r={9} className="fill-primary" />
        <Camera
          x={66}
          y={98}
          width={12}
          height={12}
          strokeWidth={2}
          className="text-primary-foreground"
        />
      </g>
      {FIELDS.map((field) => (
        <g key={field.y}>
          <Line x={96} y={field.y} width={30} />
          <rect
            x={96}
            y={field.y + 9}
            width={124}
            height={14}
            rx={5}
            className="fill-background stroke-border"
          />
          <Line
            x={102}
            y={field.y + 13}
            width={field.fill}
            strong
            className="grow-in origin-left fill-foreground/55 transform-fill"
          />
        </g>
      ))}
    </>
  )
}

const ROLES = [
  { y: 52, width: 66, picked: true },
  { y: 78, width: 54, picked: true },
  { y: 104, width: 70, picked: false },
  { y: 130, width: 48, picked: false },
]

export function ResumeScene() {
  return (
    <>
      <rect
        x={20}
        y={44}
        width={84}
        height={108}
        rx={6}
        className="fill-background stroke-border"
      />
      <Line x={30} y={56} width={44} strong />
      {[72, 84, 96, 108, 120, 132].map((y, i) => (
        <Line key={y} x={30} y={y} width={i % 2 ? 46 : 62} />
      ))}
      <g className="pop-in">
        <circle cx={100} cy={48} r={11} className="fill-primary" />
        <FileUp
          x={93}
          y={41}
          width={14}
          height={14}
          strokeWidth={2}
          className="text-primary-foreground"
        />
      </g>
      <IconDot cx={126} cy={98} r={11} icon={ScanSearch} />
      {ROLES.map((role) => (
        <g key={role.y} className="pop-in">
          <rect
            x={146}
            y={role.y}
            width={role.width + 8}
            height={18}
            rx={9}
            className={
              role.picked
                ? "fill-brand-muted stroke-brand/40"
                : "fill-background stroke-border"
            }
          />
          <Line
            x={156}
            y={role.y + 6}
            width={role.width - 14}
            className={role.picked ? "fill-brand/50" : undefined}
          />
        </g>
      ))}
    </>
  )
}

const LEVELS = [6, 12, 8, 15, 10, 5]

export function InterviewScene() {
  return (
    <>
      <rect
        x={20}
        y={42}
        width={140}
        height={112}
        rx={8}
        className="fill-muted"
      />
      <circle cx={90} cy={86} r={16} className="fill-muted-foreground/30" />
      <path
        d="M58 154a32 30 0 0 1 64 0z"
        className="fill-muted-foreground/30"
      />
      <path
        d="M70 76v-8a4 4 0 0 1 4-4h8m16 0h8a4 4 0 0 1 4 4v8m0 24v8a4 4 0 0 1-4 4h-8m-16 0h-8a4 4 0 0 1-4-4v-8"
        strokeWidth={2}
        strokeLinecap="round"
        className="pop-in fill-none stroke-brand"
      />
      <circle cx={34} cy={54} r={4} className="fill-danger" />
      <Line x={42} y={51} width={20} />
      <circle
        cx={194}
        cy={64}
        r={16}
        strokeWidth={4}
        className="fill-none stroke-muted"
      />
      <path
        pathLength={1}
        d="M194 48A16 16 0 1 1 178.8 69"
        strokeWidth={4}
        strokeLinecap="round"
        className="draw-in fill-none stroke-brand"
      />
      <rect
        x={170}
        y={92}
        width={50}
        height={30}
        rx={6}
        className="fill-background stroke-border"
      />
      <Line x={176} y={100} width={36} strong />
      <Line x={176} y={110} width={26} />
      {LEVELS.map((height, i) => (
        <rect
          key={174 + i * 7}
          x={174 + i * 7}
          y={146 - height}
          width={4}
          height={height}
          rx={2}
          className="pop-in fill-brand"
        />
      ))}
    </>
  )
}

const SKILLS = [
  { y: 94, width: 100 },
  { y: 110, width: 86 },
  { y: 126, width: 94 },
  { y: 142, width: 72 },
]

export function ScorecardScene() {
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
      <Line x={32} y={56} width={70} strong />
      <Line x={32} y={68} width={44} />
      <circle
        cx={192}
        cy={66}
        r={15}
        strokeWidth={5}
        className="fill-none stroke-muted"
      />
      <path
        pathLength={1}
        d="M192 51A15 15 0 1 1 179.34 57.96"
        strokeWidth={5}
        strokeLinecap="round"
        className="draw-in fill-none stroke-brand"
      />
      {SKILLS.map((skill) => (
        <g key={skill.y}>
          <Line x={32} y={skill.y - 3} width={48} />
          <rect
            x={92}
            y={skill.y - 3}
            width={112}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={92}
            y={skill.y - 3}
            width={skill.width}
            height={6}
            rx={3}
            className="grow-in origin-left fill-brand transform-fill"
          />
        </g>
      ))}
    </>
  )
}

export function MatchScene() {
  return (
    <>
      {[44, 102].map((y, i) => (
        <g key={y} className="pop-in">
          <rect
            x={20}
            y={y}
            width={200}
            height={48}
            rx={8}
            className={
              i === 0
                ? "fill-brand-muted stroke-brand/40"
                : "fill-background stroke-border"
            }
          />
          <IconDot cx={42} cy={y + 24} r={11} icon={Briefcase} />
          <Line x={60} y={y + 14} width={78} strong />
          <Line x={60} y={y + 27} width={54} />
          <rect
            x={176}
            y={y + 15}
            width={34}
            height={18}
            rx={9}
            className={
              i === 0 ? "fill-primary" : "fill-background stroke-border"
            }
          />
          {i === 0 && <Tick cx={156} cy={y + 24} r={8} className="pop-in" />}
        </g>
      ))}
    </>
  )
}
