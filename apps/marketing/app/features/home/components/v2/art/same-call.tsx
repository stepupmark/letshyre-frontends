import { useTranslation } from "@workspace/i18n/react"
import type { CSSProperties } from "react"

export function SameCall({ label }: { label: string }) {
  const { t } = useTranslation("home")
  const days = t("tension.scene.days", { returnObjects: true })

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 320 200"
      className="size-full"
    >
      <path d="M14 200c0-38 14-58 52-58s52 20 52 58z" className="fill-brand" />
      <rect
        x="59"
        y="122"
        width="14"
        height="22"
        rx="4"
        className="fill-muted"
      />
      <circle
        cx="66"
        cy="104"
        r="22"
        strokeWidth="2"
        className="fill-muted stroke-foreground/70"
      />
      <path
        d="M44 100c0-15 10-24 23-24 12 0 21 8 21 18-9 0-18-4-22-10-4 8-12 13-22 16z"
        className="fill-foreground/80"
      />
      <path
        d="M41 106a25 25 0 0 1 50 0"
        strokeWidth="3"
        fill="none"
        className="stroke-foreground/70"
      />
      <rect
        x="86"
        y="100"
        width="8"
        height="14"
        rx="3"
        className="fill-foreground/70"
      />
      <path
        d="M90 114c0 10-6 14-16 14"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        className="stroke-foreground/70"
      />
      <circle cx="73" cy="128" r="3" className="fill-foreground/70" />

      {days.map((day, index) => {
        const last = index === days.length - 1
        return (
          <g
            key={day}
            transform={`translate(${String(112 + index * 4)} ${String(14 + index * 40)})`}
            className="drop-in"
            style={{ "--i": index * 2 } as CSSProperties}
          >
            <rect
              width="196"
              height="32"
              rx="10"
              strokeWidth="1.5"
              className={
                last
                  ? "fill-brand-muted stroke-brand/40"
                  : "fill-card stroke-border"
              }
            />
            <text
              x="12"
              y="20"
              className="fill-muted-foreground text-xs font-medium tabular-nums"
            >
              {day}
            </text>
            <text
              x="44"
              y="20"
              className={
                last
                  ? "fill-foreground text-xs font-medium"
                  : "fill-muted-foreground text-xs"
              }
            >
              {t("tension.scene.question")}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
