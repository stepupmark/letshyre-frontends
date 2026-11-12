import { useFormat, useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { commuteCost, numberOf } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

export default function CommuteCost() {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const money = useRupees()
  const [days, setDays] = useState("5")
  const [minutes, setMinutes] = useState("150")
  const [cost, setCost] = useState("350")
  const result = commuteCost({
    daysPerWeek: numberOf(days),
    minutesPerTrip: numberOf(minutes),
    costPerTrip: numberOf(cost),
  })
  const whole = (value: number) =>
    format.number(value, { maximumFractionDigits: 0 })

  return (
    <ToolFrame
      title={t("mdx.commuteCost.title")}
      note={t("mdx.commuteCost.note")}
      fields={
        <>
          <ToolField
            label={t("mdx.commuteCost.days")}
            type="number"
            inputMode="numeric"
            min={0}
            max={7}
            value={days}
            onChange={(event) => {
              setDays(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.commuteCost.minutes")}
            type="number"
            inputMode="numeric"
            min={0}
            value={minutes}
            onChange={(event) => {
              setMinutes(event.target.value)
            }}
          />
          <ToolMoneyField
            label={t("mdx.commuteCost.cost")}
            value={cost}
            onValueChange={setCost}
          />
        </>
      }
      results={
        <>
          <ToolResult
            label={t("mdx.commuteCost.hours")}
            value={whole(result.hoursPerMonth)}
          />
          <ToolResult
            label={t("mdx.commuteCost.money")}
            value={money(result.costPerMonth)}
          />
          <ToolResult
            label={t("mdx.commuteCost.workdays")}
            value={whole(result.workdaysPerYear)}
          />
        </>
      }
    />
  )
}
