import { useTranslation } from "@workspace/i18n/react"
import { Clock, Eye, Link2, Play, UserPlus } from "lucide-react"

import { IconDot, Line, Tick } from "@/components/art/svg"
import { Label } from "@/components/art/label"

const METRICS = [
  { y: 50, value: 64 },
  { y: 66, value: 56 },
  { y: 82, value: 70 },
  { y: 98, value: 48 },
]

export function ReviewScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <circle
        cx={50}
        cy={78}
        r={26}
        strokeWidth={6}
        className="fill-none stroke-muted"
      />
      <circle
        cx={50}
        cy={78}
        r={26}
        pathLength={100}
        strokeDasharray="82 100"
        strokeWidth={6}
        strokeLinecap="round"
        transform="rotate(-90 50 78)"
        className="fill-none stroke-brand"
      />
      <text
        x={50}
        y={81}
        textAnchor="middle"
        fontSize={15}
        className="fill-foreground font-semibold tabular-nums"
      >
        {t("scenes.score")}
      </text>
      <Label x={50} y={93} anchor="middle">
        {t("scenes.outOf")}
      </Label>

      {METRICS.map((metric) => (
        <g key={metric.y}>
          <Line x={96} y={metric.y - 3} width={36} />
          <rect
            x={142}
            y={metric.y - 3}
            width={78}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={142}
            y={metric.y - 3}
            width={metric.value}
            height={6}
            rx={3}
            className="grow-in origin-left fill-brand transform-fill"
          />
        </g>
      ))}

      <rect
        x={20}
        y={120}
        width={92}
        height={34}
        rx={6}
        className="fill-foreground/80"
      />
      <circle cx={66} cy={137} r={9} className="fill-background" />
      <Play
        x={62}
        y={133}
        width={8}
        height={8}
        strokeWidth={3}
        className="fill-foreground text-foreground"
      />
      {[124, 144].map((y) => (
        <g key={y} className="pop-in">
          <circle cx={130} cy={y + 3} r={5} className="fill-brand-muted" />
          <Line x={142} y={y - 1} width={78} strong />
          <Line x={142} y={y + 7} width={56} />
        </g>
      ))}
    </>
  )
}

export function TeamScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <rect
        x={18}
        y={44}
        width={96}
        height={110}
        rx={10}
        className="fill-background stroke-border"
      />
      <IconDot cx={40} cy={68} r={12} icon={UserPlus} />
      <Line x={28} y={92} width={60} strong />
      <Line x={28} y={104} width={44} />
      <g className="pop-in">
        <rect
          x={28}
          y={122}
          width={58}
          height={18}
          rx={6}
          className="fill-brand-muted"
        />
        <Label
          x={57}
          y={134}
          anchor="middle"
          className="fill-brand-text font-semibold"
        >
          {t("scenes.recruiter")}
        </Label>
      </g>

      <rect
        x={126}
        y={44}
        width={96}
        height={110}
        rx={10}
        className="fill-background stroke-border"
      />
      <IconDot cx={148} cy={68} r={12} icon={Link2} />
      <Line x={136} y={92} width={66} strong />
      {[
        { y: 112, icon: Clock, text: t("scenes.expires") },
        { y: 132, icon: Eye, text: t("scenes.views") },
      ].map(({ y, icon: Icon, text }) => (
        <g key={y} className="pop-in">
          <Icon
            x={136}
            y={y - 8}
            width={11}
            height={11}
            strokeWidth={2.25}
            className="text-muted-foreground"
          />
          <Label x={152} y={y + 1}>
            {text}
          </Label>
        </g>
      ))}
      <Tick cx={214} cy={50} r={9} className="pop-in" />
    </>
  )
}
