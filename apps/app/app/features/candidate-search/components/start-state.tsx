import { useTranslation } from "@workspace/i18n/react"
import type { CSSProperties } from "react"

const wait = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function StartState() {
  const { t } = useTranslation("candidateSearch")
  return (
    <section
      aria-labelledby="search-start"
      className="grid items-center gap-8 rounded-xl border p-6 sm:p-8 lg:grid-cols-5"
    >
      <div className="flex flex-col gap-2 lg:col-span-2">
        <h2
          id="search-start"
          className="text-xl font-semibold tracking-tight text-balance text-brand-text"
        >
          {t("start.title")}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("start.body")}
        </p>
      </div>
      <LayoutArt />
    </section>
  )
}

function LayoutArt() {
  return (
    <svg
      viewBox="0 0 360 180"
      aria-hidden="true"
      className="w-full max-w-md justify-self-center lg:col-span-3 lg:justify-self-end rtl:-scale-x-100"
    >
      <rect
        x={1}
        y={1}
        width={150}
        height={178}
        rx={10}
        className="fill-card stroke-border"
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="settle" style={wait(i * 90)}>
          {i === 1 && (
            <rect
              x={6}
              y={8 + i * 42}
              width={140}
              height={38}
              rx={6}
              className="fill-brand-muted"
            />
          )}
          <circle
            cx={24}
            cy={27 + i * 42}
            r={9}
            className={i === 1 ? "fill-brand" : "fill-brand-muted"}
          />
          <rect
            x={40}
            y={20 + i * 42}
            width={i === 1 ? 70 : 58}
            height={5}
            rx={2.5}
            className={i === 1 ? "fill-brand/70" : "fill-muted-foreground/25"}
          />
          <rect
            x={40}
            y={30 + i * 42}
            width={44}
            height={4}
            rx={2}
            className="fill-muted-foreground/15"
          />
        </g>
      ))}
      <g className="settle" style={wait(420)}>
        <rect
          x={162}
          y={1}
          width={197}
          height={178}
          rx={10}
          className="fill-card stroke-border"
        />
        <circle cx={186} cy={28} r={13} className="fill-brand-muted" />
        <rect
          x={206}
          y={20}
          width={86}
          height={6}
          rx={3}
          className="fill-brand/70"
        />
        <rect
          x={206}
          y={31}
          width={60}
          height={4}
          rx={2}
          className="fill-muted-foreground/20"
        />
        <rect
          x={174}
          y={62}
          width={172}
          height={6}
          rx={3}
          className="fill-muted"
        />
        <rect
          x={174}
          y={62}
          width={118}
          height={6}
          rx={3}
          className="grow-x fill-brand"
          style={wait(700)}
        />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={174}
            y={86 + i * 14}
            width={[150, 120, 136][i]}
            height={4}
            rx={2}
            className="fill-muted-foreground/15"
          />
        ))}
        <rect
          x={174}
          y={140}
          width={72}
          height={24}
          rx={6}
          className="pop fill-brand"
          style={wait(900)}
        />
      </g>
    </svg>
  )
}
