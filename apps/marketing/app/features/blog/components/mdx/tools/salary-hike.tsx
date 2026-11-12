import { useFormat, useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { numberOf, salaryHike } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

export default function SalaryHike() {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const money = useRupees()
  const [current, setCurrent] = useState("2000000")
  const [offered, setOffered] = useState("2600000")
  const [variable, setVariable] = useState("10")
  const result = salaryHike({
    current: numberOf(current),
    offered: numberOf(offered),
    variableShare: numberOf(variable) / 100,
  })
  const percent = (value: number) =>
    format.number(value, { style: "percent", maximumFractionDigits: 1 })

  return (
    <ToolFrame
      title={t("mdx.salaryHike.title")}
      note={t("mdx.salaryHike.note")}
      fields={
        <>
          <ToolMoneyField
            label={t("mdx.salaryHike.current")}
            value={current}
            onValueChange={setCurrent}
          />
          <ToolMoneyField
            label={t("mdx.salaryHike.offered")}
            value={offered}
            onValueChange={setOffered}
          />
          <ToolField
            label={t("mdx.salaryHike.variable")}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={variable}
            onChange={(event) => {
              setVariable(event.target.value)
            }}
          />
        </>
      }
      results={
        <>
          <ToolResult
            label={t("mdx.salaryHike.ctcHike")}
            value={percent(result.ctcHike)}
          />
          <ToolResult
            label={t("mdx.salaryHike.inHandHike")}
            value={percent(result.inHandHike)}
          />
          <ToolResult
            label={t("mdx.salaryHike.extra")}
            value={money(result.extraPerMonth)}
          />
        </>
      }
    />
  )
}
