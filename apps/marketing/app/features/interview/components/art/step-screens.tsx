import {
  Bot,
  Briefcase,
  Camera,
  Download,
  Globe,
  type LucideIcon,
  Mic,
  MonitorUp,
  MousePointer2,
  Video,
  X,
} from "lucide-react"
import type { ReactNode } from "react"

import { IconDot, Line, Tick } from "@/components/art/svg"

import type { StepId } from "../../lib/sections"

const SCREENS: Record<StepId, () => ReactNode> = {
  download: DownloadScreen,
  signIn: SignInScreen,
  dashboard: DashboardScreen,
  clearEnv: ClearEnvScreen,
  permissions: PermissionsScreen,
  verifyId: VerifyIdScreen,
  chooseRole: ChooseRoleScreen,
  begin: BeginScreen,
}

/** What the desktop app shows at each step, sketched. */
export function StepScreen({ step }: { step: StepId }) {
  const Screen = SCREENS[step]
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" className="w-full">
      <rect
        x={8}
        y={6}
        width={224}
        height={128}
        rx={12}
        className="fill-card stroke-border"
      />
      {[22, 32, 42].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={19}
          r={3}
          className="fill-muted-foreground/25"
        />
      ))}
      <rect x={8} y={32} width={224} height={1} className="fill-border" />
      <Screen />
    </svg>
  )
}

function DownloadScreen() {
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

function SignInScreen() {
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

function DashboardScreen() {
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

function ClearEnvScreen() {
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

function PermissionsScreen() {
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

function VerifyIdScreen() {
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

function ChooseRoleScreen() {
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

function BeginScreen() {
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
