import { useTranslation } from "@workspace/i18n/react"
import { Check, FileText, Lock } from "lucide-react"

import { Label } from "@/components/art/label"
import { Line, Tick } from "@/components/art/svg"

export function AccountScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <Label x={22} y={56} strong>
        {t("scenes.checkEmail")}
      </Label>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect
            x={22 + i * 23}
            y={66}
            width={19}
            height={26}
            rx={5}
            className={
              i === 5
                ? "fill-background stroke-brand"
                : "fill-background stroke-border"
            }
          />
          <circle
            cx={31.5 + i * 23}
            cy={79}
            r={3}
            className="pop-in fill-foreground/70"
          />
        </g>
      ))}

      <rect
        x={22}
        y={112}
        width={100}
        height={24}
        rx={7}
        className="fill-primary"
      />
      <Label
        x={72}
        y={128}
        anchor="middle"
        className="fill-primary-foreground font-semibold"
      >
        {t("scenes.create")}
      </Label>
      <Tick cx={140} cy={124} r={9} className="pop-in" />

      <rect
        x={178}
        y={44}
        width={42}
        height={80}
        rx={8}
        className="fill-background stroke-border"
      />
      <rect
        x={192}
        y={49}
        width={14}
        height={3}
        rx={1.5}
        className="fill-muted-foreground/25"
      />
      <g className="pop-in">
        <rect
          x={184}
          y={64}
          width={30}
          height={18}
          rx={6}
          className="fill-brand-muted"
        />
        {[192, 199, 206].map((cx) => (
          <circle key={cx} cx={cx} cy={73} r={2} className="fill-brand" />
        ))}
      </g>
      <Line x={186} y={92} width={26} />
      <Label x={199} y={140} anchor="middle">
        {t("scenes.sms")}
      </Label>
    </>
  )
}

export function ProfileScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      <rect
        x={16}
        y={44}
        width={136}
        height={84}
        rx={9}
        className="fill-background stroke-border"
      />
      <Label x={26} y={58} className="fill-brand-text font-semibold">
        {t("scenes.aadhaar")}
      </Label>
      <rect
        x={26}
        y={66}
        width={30}
        height={38}
        rx={5}
        className="fill-brand-muted"
      />
      <circle cx={41} cy={80} r={6} className="fill-brand/40" />
      <path d="M31 104 q10 -14 20 0 z" className="fill-brand/40" />
      <Line x={64} y={70} width={60} strong />
      <Line x={64} y={83} width={74} />
      <Label x={64} y={102} className="fill-foreground font-semibold">
        {t("scenes.masked")}
      </Label>
      <g className="pop-in">
        <circle cx={142} cy={120} r={15} className="fill-primary" />
        <text
          x={142}
          y={124}
          textAnchor="middle"
          fontSize={10}
          className="fill-primary-foreground font-bold"
        >
          {t("scenes.adult")}
        </text>
      </g>

      <path
        d="M172 54 V44 H182 M212 44 H222 V54 M222 102 V112 H212 M182 112 H172 V102"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="fill-none stroke-brand"
      />
      <circle cx={197} cy={72} r={10} className="fill-muted-foreground/30" />
      <path d="M181 108 q16 -22 32 0 z" className="fill-muted-foreground/30" />
      <rect
        x={174}
        y={77}
        width={46}
        height={1.5}
        rx={0.75}
        className="scan fill-brand"
      />

      <g className="pop-in">
        <rect
          x={16}
          y={138}
          width={98}
          height={18}
          rx={9}
          className="fill-success-muted"
        />
        <Check
          x={23}
          y={141}
          width={12}
          height={12}
          strokeWidth={3}
          className="text-success"
        />
        <Label x={39} y={150} className="fill-success font-semibold">
          {t("scenes.saved")}
        </Label>
      </g>
    </>
  )
}

const DOCUMENTS = ["resignation", "experience", "notice"] as const

export function DocumentsScene() {
  const { t } = useTranslation("candidateGuide")

  return (
    <>
      {DOCUMENTS.map((doc, i) => {
        const y = 44 + i * 28
        return (
          <g key={doc}>
            <rect
              x={16}
              y={y}
              width={124}
              height={22}
              rx={6}
              className="fill-background stroke-border"
            />
            <FileText
              x={22}
              y={y + 4}
              width={14}
              height={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <Label x={40} y={y + 14}>
              {t(`scenes.${doc}`)}
            </Label>
            <Tick cx={128} cy={y + 11} r={6} className="pop-in" />
          </g>
        )
      })}
      <rect
        x={16}
        y={134}
        width={124}
        height={20}
        rx={10}
        className="fill-brand-muted"
      />
      <Lock
        x={24}
        y={138}
        width={12}
        height={12}
        strokeWidth={2.25}
        className="text-brand-text"
      />
      <Label x={40} y={147} className="fill-brand-text font-semibold">
        {t("scenes.private")}
      </Label>

      <path
        d="M152 50 a6 6 0 0 1 6 -6 h18 l10 10 v36 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
        className="fill-background stroke-border"
      />
      <path d="M176 44 v10 h10" className="fill-none stroke-border" />
      <Line x={159} y={62} width={20} strong />
      {[72, 80].map((y) => (
        <Line key={y} x={159} y={y} width={18} />
      ))}
      <path
        d="M169 100 v10 m-4 -4 l4 4 l4 -4"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pop-in fill-none stroke-brand"
      />
      <g className="pop-in">
        <rect
          x={146}
          y={116}
          width={80}
          height={17}
          rx={8.5}
          className="fill-brand-muted"
        />
        <Label
          x={186}
          y={128}
          anchor="middle"
          className="fill-brand-text font-semibold"
        >
          {t("scenes.roleA")}
        </Label>
      </g>
      <rect
        x={146}
        y={138}
        width={80}
        height={17}
        rx={8.5}
        className="fill-none stroke-border"
      />
      <Label x={186} y={150} anchor="middle">
        {t("scenes.roleB")}
      </Label>
    </>
  )
}
