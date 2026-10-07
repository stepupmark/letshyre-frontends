import { useFormat, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { CheckIcon } from "lucide-react"
import { useId, useState } from "react"

import { Section, SectionHeader } from "@/components/section"

import { usePlanCopy } from "../hooks/use-plan-copy"
import { usePlans } from "../hooks/use-plans"
import {
  COMPARISON_ROWS,
  comparisonValue,
  type ComparisonValue,
} from "../lib/plans"

const COL = "col"
const ROW = "row"

function Value({ value }: { value: ComparisonValue }) {
  const { t } = useTranslation("pricing")
  const format = useFormat()

  if (value === true) {
    return (
      <>
        <CheckIcon aria-hidden className="mx-auto size-4 text-brand" />
        <span className="sr-only">{t("compare.values.included")}</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden className="text-muted-foreground">
          —
        </span>
        <span className="sr-only">{t("compare.values.notIncluded")}</span>
      </>
    )
  }
  if (value === null) return t("compare.values.custom")
  if (value === "noExpiry") return t("compare.values.noExpiry")
  return format.number(value)
}

export function PlanComparisonTable() {
  const { t } = useTranslation("pricing")
  const titleId = useId()
  const copy = usePlanCopy()
  const { plans } = usePlans()
  const [picked, setPicked] = useState<string | null>(null)
  const selected = plans.some((plan) => plan.id === picked)
    ? picked
    : (plans.find((plan) => plan.featured) ?? plans[0])?.id

  return (
    <Section aria-labelledby={titleId} className="py-12 sm:py-16">
      <SectionHeader
        id={titleId}
        title={<span className="text-brand">{t("compare.title")}</span>}
        description={t("compare.body")}
      />

      <div
        role="group"
        aria-label={t("compare.picker")}
        className="mt-6 grid grid-flow-col gap-1 rounded-lg border p-1 md:hidden"
      >
        {plans.map((plan) => (
          <Button
            key={plan.id}
            variant="ghost"
            aria-pressed={plan.id === selected}
            className="aria-pressed:bg-brand/10 aria-pressed:text-foreground"
            onClick={() => {
              setPicked(plan.id)
            }}
          >
            {copy.name(plan)}
          </Button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border md:mt-8">
        <Table className="md:table-fixed">
          <TableCaption className="sr-only">
            {t("compare.caption")}
          </TableCaption>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead scope={COL} className="h-12 px-4 md:w-1/3 md:px-6">
                {t("compare.feature")}
              </TableHead>
              {plans.map((plan) => (
                <TableHead
                  key={plan.id}
                  scope={COL}
                  data-selected={plan.id === selected || undefined}
                  data-featured={plan.featured || undefined}
                  className="h-12 px-4 text-center data-featured:bg-brand/10 max-md:not-data-selected:hidden"
                >
                  {copy.name(plan)}
                  {plan.featured && (
                    <span className="sr-only"> ({t("plans.recommended")})</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARISON_ROWS.map((row) => (
              <TableRow key={row} className="hover:bg-transparent">
                <TableHead
                  scope={ROW}
                  className="h-auto px-4 py-3 font-normal whitespace-normal md:px-6"
                >
                  {t(`compare.rows.${row}`)}
                </TableHead>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.id}
                    data-selected={plan.id === selected || undefined}
                    data-featured={plan.featured || undefined}
                    className="px-4 py-3 text-center tabular-nums data-featured:bg-brand/5 max-md:not-data-selected:hidden"
                  >
                    <Value value={comparisonValue(row, plan)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  )
}
