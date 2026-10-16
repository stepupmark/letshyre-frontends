import { useTranslation } from "@workspace/i18n/react"
import { Building2, LockOpen, Timer } from "lucide-react"

import { wait } from "@/components/art/delay"
import { Label } from "@/components/art/label"
import { IconDot, Line } from "@/components/art/svg"

export function InterviewScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <circle cx={22} cy={47} r={4} className="pop fill-danger" />
      <Label x={31} y={50} className="fill-danger font-semibold">
        {t("scenes.rec")}
      </Label>
      <rect
        x={166}
        y={39}
        width={56}
        height={16}
        rx={8}
        className="fill-brand-muted"
      />
      <Timer
        x={172}
        y={42}
        width={10}
        height={10}
        strokeWidth={2.5}
        className="text-brand-text"
      />
      <Label
        x={186}
        y={50.5}
        className="fill-brand-text font-semibold tabular-nums"
      >
        {t("scenes.timer")}
      </Label>

      <rect
        x={16}
        y={62}
        width={142}
        height={92}
        rx={8}
        className="fill-background stroke-border"
      />
      <Label x={26} y={78} strong>
        {t("scenes.question")}
      </Label>
      <Line x={26} y={88} width={112} />
      <Line x={26} y={100} width={96} />
      <Line x={26} y={112} width={70} />
      <rect
        x={26}
        y={134}
        width={120}
        height={6}
        rx={3}
        className="fill-muted"
      />
      <rect
        x={26}
        y={134}
        width={78}
        height={6}
        rx={3}
        className="bar-in fill-brand"
        style={wait(300)}
      />

      <rect
        x={166}
        y={62}
        width={56}
        height={46}
        rx={6}
        className="fill-muted"
      />
      <circle cx={194} cy={80} r={8} className="fill-muted-foreground/30" />
      <path d="M180 108 q14 -20 28 0 z" className="fill-muted-foreground/30" />
      <Label x={166} y={126}>
        {t("scenes.strikes")}
      </Label>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={166 + i * 19}
          y={134}
          width={16}
          height={6}
          rx={3}
          className="fill-muted"
        />
      ))}
    </>
  )
}

export function AfterScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <rect
        x={16}
        y={44}
        width={100}
        height={108}
        rx={8}
        className="fill-background stroke-border"
      />
      <Label x={26} y={60} strong>
        {t("scenes.scorecard")}
      </Label>
      <circle
        cx={66}
        cy={100}
        r={24}
        strokeWidth={6}
        className="fill-none stroke-muted"
      />
      <circle
        cx={66}
        cy={100}
        r={24}
        strokeWidth={6}
        pathLength={1}
        strokeLinecap="round"
        transform="rotate(-90 66 100)"
        className="ink fill-none stroke-brand"
        style={{ strokeDasharray: "0.82 2" }}
      />
      <text
        x={66}
        y={105}
        textAnchor="middle"
        fontSize={15}
        className="fill-foreground font-semibold tabular-nums"
      >
        {t("scenes.score")}
      </text>
      <Line x={36} y={136} width={60} />

      <path
        d="M124 98 h18 m-5 -5 l5 5 l-5 5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pop-in fill-none stroke-brand"
      />

      <rect
        x={150}
        y={54}
        width={74}
        height={88}
        rx={8}
        className="fill-background stroke-border"
      />
      <IconDot cx={187} cy={76} r={12} icon={Building2} />
      <Line x={162} y={96} width={50} strong />
      <Line x={166} y={108} width={42} />
      <g className="pop-in">
        <rect
          x={156}
          y={118}
          width={62}
          height={16}
          rx={8}
          className="fill-success-muted"
        />
        <LockOpen
          x={161}
          y={120.5}
          width={11}
          height={11}
          strokeWidth={2.25}
          className="text-success"
        />
        <Label x={175} y={129.5} className="fill-success font-semibold">
          {t("scenes.unlocked")}
        </Label>
      </g>
    </>
  )
}
