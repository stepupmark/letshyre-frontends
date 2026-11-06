import { useTranslation } from "@workspace/i18n/react"
import { Check, LockOpen } from "lucide-react"

import { IconDot, Line } from "@/components/art/svg"
import { Label } from "@/components/art/label"

const ROWS = [
  { y: 80, match: 46 },
  { y: 108, match: 34 },
  { y: 136, match: 22 },
]

export function PoolScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <rect
        x={20}
        y={44}
        width={124}
        height={20}
        rx={10}
        className="fill-muted"
      />
      <rect
        x={22}
        y={46}
        width={66}
        height={16}
        rx={8}
        className="fill-primary"
      />
      <Label
        x={55}
        y={57}
        anchor="middle"
        className="fill-primary-foreground font-semibold"
      >
        {t("scenes.matched")}
      </Label>
      <Label x={116} y={57} anchor="middle">
        {t("scenes.applied")}
      </Label>
      <rect
        x={154}
        y={44}
        width={66}
        height={20}
        rx={6}
        className="fill-background stroke-border"
      />
      <Line x={162} y={51} width={34} />
      <path
        d="M206 52 l3 3 l3 -3"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="fill-none stroke-muted-foreground"
      />

      {ROWS.map((row, i) => (
        <g key={row.y} className="pop-in">
          {i > 0 && (
            <rect
              x={20}
              y={row.y - 14}
              width={200}
              height={1}
              className="fill-border"
            />
          )}
          <circle cx={30} cy={row.y} r={9} className="fill-brand-muted" />
          <Line x={46} y={row.y - 7} width={56} strong />
          <Line x={46} y={row.y + 3} width={38} />
          <rect
            x={128}
            y={row.y - 3}
            width={48}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={128}
            y={row.y - 3}
            width={row.match}
            height={6}
            rx={3}
            className="grow-in origin-left fill-brand transform-fill"
          />
          {i === 0 && (
            <>
              <rect
                x={184}
                y={row.y - 8}
                width={36}
                height={16}
                rx={5}
                className="fill-brand-muted"
              />
              <Label
                x={202}
                y={row.y + 3}
                anchor="middle"
                className="fill-brand-text font-semibold"
              >
                {t("scenes.strong")}
              </Label>
            </>
          )}
        </g>
      ))}
    </>
  )
}

export function UnlockScene() {
  const { t } = useTranslation("employerGuide")

  return (
    <>
      <circle cx={32} cy={58} r={12} className="fill-brand-muted" />
      <Line x={52} y={50} width={60} strong />
      <Line x={52} y={61} width={42} />

      {[86, 106].map((y, i) => (
        <g key={y}>
          <rect
            x={20}
            y={y - 6}
            width={12}
            height={12}
            rx={3}
            className={
              i === 0 ? "fill-primary" : "fill-background stroke-border"
            }
          />
          {i === 0 && (
            <Check
              x={22}
              y={y - 4}
              width={8}
              height={8}
              strokeWidth={3.5}
              className="pop-in text-primary-foreground"
            />
          )}
          <Line x={40} y={y - 3} width={i === 0 ? 70 : 54} />
        </g>
      ))}

      <rect
        x={20}
        y={126}
        width={112}
        height={24}
        rx={7}
        className="fill-primary"
      />
      <Label
        x={76}
        y={142}
        anchor="middle"
        className="fill-primary-foreground font-semibold"
      >
        {t("scenes.unlock")}
      </Label>

      <rect
        x={146}
        y={44}
        width={76}
        height={106}
        rx={8}
        className="fill-muted/50 stroke-border"
      />
      <Label x={156} y={60}>
        {t("scenes.balance")}
      </Label>
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx={161 + (i % 5) * 12}
          cy={i < 5 ? 76 : 90}
          r={4}
          strokeDasharray={i === 9 ? "2 2" : undefined}
          className={i === 9 ? "fill-none stroke-brand" : "fill-brand"}
        />
      ))}
      <g className="pop-in">
        <IconDot cx={184} cy={124} r={14} icon={LockOpen} />
      </g>
    </>
  )
}
