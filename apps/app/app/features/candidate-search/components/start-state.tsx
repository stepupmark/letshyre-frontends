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
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="settle" style={wait(i * 90)}>
          <rect
            x={1}
            y={1 + i * 45}
            width={358}
            height={38}
            rx={8}
            className={
              i === 1
                ? "fill-brand-muted stroke-brand/40"
                : "fill-card stroke-border"
            }
          />
          <circle
            cx={22}
            cy={20 + i * 45}
            r={9}
            className={i === 1 ? "fill-brand" : "fill-brand-muted"}
          />
          <rect
            x={40}
            y={13 + i * 45}
            width={i === 1 ? 74 : 60}
            height={5}
            rx={2.5}
            className={i === 1 ? "fill-brand/70" : "fill-muted-foreground/25"}
          />
          <rect
            x={40}
            y={23 + i * 45}
            width={46}
            height={4}
            rx={2}
            className="fill-muted-foreground/15"
          />
          <rect
            x={312}
            y={15 + i * 45}
            width={30}
            height={10}
            rx={5}
            className="fill-muted"
          />
        </g>
      ))}
      <g className="settle" style={wait(420)}>
        <rect
          x={120}
          y={30}
          width={200}
          height={146}
          rx={10}
          className="fill-card stroke-border"
        />
        <circle cx={144} cy={56} r={13} className="fill-brand-muted" />
        <rect
          x={164}
          y={48}
          width={86}
          height={6}
          rx={3}
          className="fill-brand/70"
        />
        <rect
          x={164}
          y={59}
          width={60}
          height={4}
          rx={2}
          className="fill-muted-foreground/20"
        />
        <rect
          x={132}
          y={84}
          width={176}
          height={6}
          rx={3}
          className="fill-muted"
        />
        <rect
          x={132}
          y={84}
          width={120}
          height={6}
          rx={3}
          className="grow-x fill-brand"
          style={wait(700)}
        />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect
              x={132 + i * 90}
              y={104}
              width={84}
              height={22}
              rx={6}
              className="fill-card stroke-border"
            />
            <rect
              x={142 + i * 90}
              y={113}
              width={40}
              height={4}
              rx={2}
              className="fill-muted-foreground/20"
            />
          </g>
        ))}
        <rect
          x={132}
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
