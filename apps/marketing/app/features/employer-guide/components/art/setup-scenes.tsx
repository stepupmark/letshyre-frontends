import { useTranslation } from "@workspace/i18n/react"
import { Clock, Mail } from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"

import { Label } from "./label"

export function AccountScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <Label x={22} y={58} strong>
        {t("scenes.code")}
      </Label>
      <Line x={22} y={66} width={96} />
      <IconDot cx={206} cy={60} r={14} icon={Mail} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect
            x={22 + i * 33}
            y={82}
            width={27}
            height={30}
            rx={6}
            className={
              i === 5
                ? "fill-background stroke-brand"
                : "fill-background stroke-border"
            }
          />
          <circle
            cx={35.5 + i * 33}
            cy={97}
            r={3.5}
            className="pop-in fill-foreground/70"
          />
        </g>
      ))}
      <rect
        x={22}
        y={126}
        width={92}
        height={24}
        rx={7}
        className="fill-primary"
      />
      <Label
        x={68}
        y={142}
        anchor="middle"
        className="fill-primary-foreground font-semibold"
      >
        {t("scenes.verify")}
      </Label>
      <Tick cx={206} cy={138} r={11} className="pop-in" />
    </>
  )
}

const STEPS = ["details", "legal", "documents"] as const

export function CompanyScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      {STEPS.map((step, i) => (
        <g key={step}>
          <Tick cx={27 + i * 72} cy={52} r={7} className="pop-in" />
          <Label x={39 + i * 72} y={55}>
            {t(`scenes.${step}`)}
          </Label>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={20 + i * 72}
            y={70}
            width={56}
            height={52}
            rx={8}
            className="fill-muted/50 stroke-border"
          />
          <Line x={30 + i * 72} y={84} width={30} strong />
          <Line x={30 + i * 72} y={96} width={36} />
          <Line x={30 + i * 72} y={106} width={24} />
          <Tick cx={72 + i * 72} cy={72} r={7} className="pop-in" />
        </g>
      ))}
      <g className="pop-in">
        <rect
          x={20}
          y={136}
          width={96}
          height={20}
          rx={10}
          className="fill-brand-muted"
        />
        <Clock
          x={28}
          y={140}
          width={12}
          height={12}
          strokeWidth={2.25}
          className="text-brand-text"
        />
        <Label x={45} y={149} className="fill-brand-text font-semibold">
          {t("scenes.review")}
        </Label>
      </g>
    </>
  )
}

const FIELDS = [
  { y: 44, value: 64, fromJd: true },
  { y: 74, value: 48, fromJd: true },
  { y: 104, value: 56, fromJd: true },
  { y: 134, value: 0, fromJd: false },
]

export function PostScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <path
        d="M18 50 a6 6 0 0 1 6 -6 h36 l14 14 v64 a6 6 0 0 1 -6 6 h-44 a6 6 0 0 1 -6 -6 z"
        className="fill-background stroke-border"
      />
      <path d="M60 44 v14 h14" className="fill-none stroke-border" />
      <Line x={26} y={66} width={34} strong />
      {[78, 88, 98, 108].map((y, i) => (
        <Line key={y} x={26} y={y} width={i % 2 ? 30 : 40} />
      ))}
      <path
        d="M84 86 h14 m-5 -5 l5 5 l-5 5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pop-in fill-none stroke-brand"
      />
      {FIELDS.map((field) => (
        <g key={field.y}>
          <Line x={108} y={field.y} width={34} />
          <rect
            x={108}
            y={field.y + 9}
            width={114}
            height={17}
            rx={5}
            strokeDasharray={field.fromJd ? undefined : "3 3"}
            className={
              field.fromJd
                ? "fill-background stroke-border"
                : "fill-none stroke-brand/60"
            }
          />
          {field.fromJd && (
            <>
              <rect
                x={114}
                y={field.y + 15}
                width={field.value}
                height={5}
                rx={2.5}
                className="grow-in origin-left fill-foreground/45 transform-fill"
              />
              <g className="pop-in">
                <rect
                  x={150}
                  y={field.y - 4}
                  width={60}
                  height={11}
                  rx={4}
                  className="fill-brand-muted"
                />
                <text
                  x={180}
                  y={field.y + 4}
                  textAnchor="middle"
                  fontSize={7}
                  className="fill-brand-text font-semibold"
                >
                  {t("scenes.fromJd")}
                </text>
              </g>
            </>
          )}
        </g>
      ))}
    </>
  )
}
