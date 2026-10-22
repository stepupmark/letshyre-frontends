import { useTranslation } from "@workspace/i18n/react"
import { Trophy } from "lucide-react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { leaders } from "../../lib/compare"

export type Score = number | null | undefined

export function Group({ label, span }: { label: string; span: number }) {
  return (
    <tr className="border-b bg-muted/50">
      <th
        scope="colgroup"
        colSpan={span + 1}
        className="px-4 py-2 text-start text-xs font-medium text-muted-foreground"
      >
        <span className="sticky inset-s-4">{label}</span>
      </th>
    </tr>
  )
}

export function ScoreRow({
  label,
  values,
  index,
}: {
  label: string
  values: Score[]
  index: number
}) {
  const top = leaders(values)
  return (
    <tr className="border-b last:border-0">
      <RowLabel>{label}</RowLabel>
      {values.map((value, i) => (
        <td
          key={i}
          data-lead={top.has(i)}
          className="p-4 align-middle data-[lead=true]:bg-brand-muted/40"
        >
          {typeof value === "number" ? (
            <Bar value={value} lead={top.has(i)} index={index} />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
      ))}
    </tr>
  )
}

export function TextRow({
  label,
  values,
}: {
  label: string
  values: (string | null | undefined)[]
}) {
  return (
    <tr className="border-b last:border-0">
      <RowLabel>{label}</RowLabel>
      {values.map((value, i) => (
        <td key={i} className="p-4 align-top text-pretty">
          {value ?? <span className="text-muted-foreground">—</span>}
        </td>
      ))}
    </tr>
  )
}

function RowLabel({ children }: { children: string }) {
  return (
    <th
      scope="row"
      className="sticky inset-s-0 z-10 bg-card p-4 text-start align-top font-normal text-balance text-muted-foreground"
    >
      {children}
    </th>
  )
}

function Bar({
  value,
  lead,
  index,
}: {
  value: number
  lead: boolean
  index: number
}) {
  const { t } = useTranslation("scorecard")
  const clamped = Math.round(Math.min(100, Math.max(0, value)))
  return (
    <div className="flex items-center gap-3">
      <span
        data-lead={lead}
        className="w-7 text-end tabular-nums data-[lead=true]:font-semibold data-[lead=true]:text-brand-text"
      >
        {clamped}
      </span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted print:border">
        <span className="block h-full" style={{ width: `${clamped}%` }}>
          <m.span
            data-lead={lead}
            className="block h-full origin-left rounded-full bg-muted-foreground/40 data-[lead=true]:bg-brand rtl:origin-right print:transform-none!"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: duration.slow,
              ease,
              delay: Math.min(index, 10) * 0.03,
            }}
          />
        </span>
      </span>
      <span className="flex size-4 shrink-0 items-center">
        {lead && (
          <>
            <Trophy aria-hidden="true" className="size-3.5 text-brand-text" />
            <span className="sr-only">{t("compare.highest")}</span>
          </>
        )}
      </span>
    </div>
  )
}
