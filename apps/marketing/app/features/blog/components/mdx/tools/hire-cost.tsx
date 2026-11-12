import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { numberOf, vacancyCost } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

export default function HireCost() {
  const { t } = useTranslation("blog")
  const money = useRupees()
  const [salary, setSalary] = useState("1800000")
  const [daysNow, setDaysNow] = useState("39")
  const [daysTarget, setDaysTarget] = useState("25")
  const { perDay, extra } = vacancyCost({
    salary: numberOf(salary),
    daysNow: numberOf(daysNow),
    daysTarget: numberOf(daysTarget),
  })

  return (
    <ToolFrame
      title={t("mdx.hireCost.title")}
      note={t("mdx.hireCost.note")}
      fields={
        <>
          <ToolMoneyField
            label={t("mdx.hireCost.salary")}
            value={salary}
            onValueChange={setSalary}
          />
          <ToolField
            label={t("mdx.hireCost.daysNow")}
            type="number"
            inputMode="numeric"
            min={0}
            value={daysNow}
            onChange={(event) => {
              setDaysNow(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.hireCost.daysTarget")}
            type="number"
            inputMode="numeric"
            min={0}
            value={daysTarget}
            onChange={(event) => {
              setDaysTarget(event.target.value)
            }}
          />
        </>
      }
      results={
        <>
          <ToolResult label={t("mdx.hireCost.perDay")} value={money(perDay)} />
          <ToolResult
            label={t("mdx.hireCost.extra", {
              count: Math.max(0, numberOf(daysNow) - numberOf(daysTarget)),
            })}
            value={money(extra)}
          />
        </>
      }
    />
  )
}
