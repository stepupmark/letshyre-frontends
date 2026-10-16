import { useTranslation } from "@workspace/i18n/react"
import {
  AudioLines,
  Briefcase,
  Webcam,
  type LucideIcon,
  ScreenShare,
} from "lucide-react"

import { wait } from "@/components/art/delay"
import { Label } from "@/components/art/label"
import { IconDot, Line, Tick } from "@/components/art/svg"

export function AppScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <rect
        x={40}
        y={42}
        width={160}
        height={86}
        rx={6}
        className="fill-background stroke-border"
      />
      <path
        d="M26 132 h188 l-10 10 h-168 z"
        className="fill-muted stroke-border"
      />
      <circle cx={62} cy={62} r={9} className="fill-brand-muted" />
      <Line x={78} y={56} width={52} strong />
      <Line x={78} y={68} width={74} />
      <rect
        x={60}
        y={90}
        width={120}
        height={22}
        rx={11}
        className="fill-primary"
      />
      <Label
        x={120}
        y={104}
        anchor="middle"
        className="fill-primary-foreground font-semibold"
      >
        {t("scenes.takeInterview")}
      </Label>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={80 + i * 14}
          cy={155}
          r={5}
          className="pop fill-brand"
          style={wait(200 + i * 150)}
        />
      ))}
      <Label x={116} y={158}>
        {t("scenes.left")}
      </Label>
    </>
  )
}

const PERMISSIONS: { id: "camera" | "mic" | "screen"; icon: LucideIcon }[] = [
  { id: "camera", icon: Webcam },
  { id: "mic", icon: AudioLines },
  { id: "screen", icon: ScreenShare },
]

const WAVE = [6, 12, 18, 10, 16, 8, 14, 6]

export function ChecksScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      {PERMISSIONS.map(({ id, icon: Icon }, i) => {
        const x = 16 + i * 72
        return (
          <g key={id}>
            <rect
              x={x}
              y={42}
              width={64}
              height={44}
              rx={8}
              className="fill-background stroke-border"
            />
            <Icon
              x={x + 8}
              y={50}
              width={14}
              height={14}
              strokeWidth={2}
              className="text-brand-text"
            />
            <rect
              x={x + 38}
              y={51}
              width={18}
              height={10}
              rx={5}
              className="fill-primary"
            />
            <circle
              cx={x + 51}
              cy={56}
              r={3.5}
              className="pop-in fill-primary-foreground"
            />
            <Label x={x + 8} y={78}>
              {t(`scenes.${id}`)}
            </Label>
          </g>
        )
      })}

      <rect
        x={16}
        y={96}
        width={100}
        height={60}
        rx={8}
        className="fill-background stroke-border"
      />
      <rect
        x={24}
        y={104}
        width={24}
        height={30}
        rx={4}
        className="fill-brand-muted"
      />
      <circle cx={36} cy={115} r={5} className="fill-brand/40" />
      <path d="M28 134 q8 -12 16 0 z" className="fill-brand/40" />
      <path d="M52 119 h28" strokeDasharray="3 3" className="stroke-brand" />
      <circle
        cx={96}
        cy={119}
        r={13}
        className="fill-none stroke-brand"
        strokeWidth={1.5}
      />
      <circle cx={96} cy={115} r={5} className="fill-muted-foreground/30" />
      <path d="M88 129 q8 -10 16 0" className="fill-muted-foreground/30" />
      <Tick cx={66} cy={119} r={7} className="pop-in" />
      <Label x={24} y={150}>
        {t("scenes.face")}
      </Label>

      <rect
        x={124}
        y={96}
        width={100}
        height={60}
        rx={8}
        className="fill-background stroke-border"
      />
      {WAVE.map((h, i) => (
        <rect
          key={i}
          x={134 + i * 7}
          y={119 - h / 2}
          width={4}
          height={h}
          rx={2}
          className="level fill-brand"
          style={wait(i * 90)}
        />
      ))}
      <Tick cx={208} cy={119} r={7} className="pop-in" />
      <Label x={132} y={150}>
        {t("scenes.voice")}
      </Label>
    </>
  )
}

export function RoleScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <rect
        x={18}
        y={44}
        width={204}
        height={44}
        rx={8}
        strokeWidth={1.5}
        className="fill-background stroke-brand"
      />
      <IconDot cx={40} cy={66} r={12} icon={Briefcase} />
      <Label x={60} y={62} strong>
        {t("scenes.roleA")}
      </Label>
      <rect
        x={60}
        y={68}
        width={76}
        height={13}
        rx={6.5}
        className="fill-brand-muted"
      />
      <text
        x={98}
        y={77}
        textAnchor="middle"
        fontSize={7.5}
        className="fill-brand-text font-semibold"
      >
        {t("scenes.fromOnboarding")}
      </text>
      <Tick cx={206} cy={66} r={8} className="pop-in" />

      <g className="slide-in">
        <rect
          x={18}
          y={96}
          width={204}
          height={40}
          rx={8}
          className="fill-muted/40 stroke-border"
        />
        <circle cx={40} cy={116} r={12} className="fill-muted" />
        <Briefcase
          x={33}
          y={109}
          width={14}
          height={14}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        <Label x={60} y={120} strong>
          {t("scenes.roleB")}
        </Label>
        <circle
          cx={206}
          cy={116}
          r={7}
          className="fill-background stroke-border"
        />
      </g>
      <rect
        x={18}
        y={144}
        width={204}
        height={14}
        rx={7}
        className="fill-primary"
      />
      <Line x={96} y={148} width={48} className="fill-primary-foreground/80" />
    </>
  )
}
