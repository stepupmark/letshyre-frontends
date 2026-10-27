import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/empty-state"

function Card({ x, y, faded }: { x: number; y: number; faded?: boolean }) {
  return (
    <g className={faded ? "opacity-50" : undefined}>
      <rect
        x={x}
        y={y}
        width={92}
        height={56}
        rx={10}
        className="fill-card stroke-border"
      />
      <circle cx={x + 20} cy={y + 20} r={9} className="fill-brand-muted" />
      <rect
        x={x + 36}
        y={y + 14}
        width={40}
        height={6}
        rx={3}
        className="fill-foreground/45"
      />
      <rect
        x={x + 36}
        y={y + 25}
        width={28}
        height={5}
        rx={2.5}
        className="fill-muted-foreground/25"
      />
      <rect
        x={x + 12}
        y={y + 40}
        width={30}
        height={8}
        rx={4}
        className="fill-muted-foreground/15"
      />
      <rect
        x={x + 46}
        y={y + 40}
        width={22}
        height={8}
        rx={4}
        className="fill-muted-foreground/15"
      />
    </g>
  )
}

/** Profiles that the filters let through to an empty slot. */
function NoMatchesArt() {
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true" className="w-48">
      <g className="settle">
        <Card x={8} y={14} faded />
        <Card x={20} y={46} faded />
      </g>
      <g className="settle" style={{ transitionDelay: "120ms" }}>
        <rect
          x={124}
          y={30}
          width={88}
          height={60}
          rx={10}
          strokeDasharray="5 5"
          className="fill-none stroke-brand/50"
        />
        <circle
          cx={164}
          cy={56}
          r={13}
          strokeWidth={3}
          className="fill-none stroke-brand"
        />
        <path
          d="M174 66 l10 10"
          strokeWidth={3}
          strokeLinecap="round"
          className="stroke-brand"
        />
      </g>
    </svg>
  )
}

export function NoMatches({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation("unlock")
  return (
    <EmptyState
      art={<NoMatchesArt />}
      title={t("filters.noMatchesTitle")}
      description={t("filters.noMatchesBody")}
      action={
        <Button variant="outline" onClick={onClear}>
          {t("filters.clear")}
        </Button>
      }
    />
  )
}
