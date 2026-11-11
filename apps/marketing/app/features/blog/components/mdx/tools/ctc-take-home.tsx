import { useFormat, useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { ctcTakeHome, numberOf } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolResult } from "./tool-frame"

export default function CtcTakeHome() {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const [ctc, setCtc] = useState("2000000")
  const [variable, setVariable] = useState("10")
  const [basic, setBasic] = useState("50")
  const result = ctcTakeHome({
    ctc: numberOf(ctc),
    variableShare: numberOf(variable) / 100,
    basicShare: numberOf(basic) / 100,
  })
  const rupees = (value: number) =>
    format.currency(Math.max(0, value), "INR", { maximumFractionDigits: 0 })

  return (
    <ToolFrame
      title={t("mdx.ctcTakeHome.title")}
      note={t("mdx.ctcTakeHome.note")}
      fields={
        <>
          <ToolField
            label={t("mdx.ctcTakeHome.ctc")}
            type="number"
            inputMode="numeric"
            min={0}
            step={50000}
            value={ctc}
            onChange={(event) => {
              setCtc(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.ctcTakeHome.variable")}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={variable}
            onChange={(event) => {
              setVariable(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.ctcTakeHome.basic")}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={basic}
            onChange={(event) => {
              setBasic(event.target.value)
            }}
          />
        </>
      }
      results={
        <>
          <ToolResult
            label={t("mdx.ctcTakeHome.monthly")}
            value={rupees(result.monthly)}
          />
          <ToolResult
            label={t("mdx.ctcTakeHome.variableAfterTax")}
            value={rupees(result.variable)}
          />
          <ToolResult
            label={t("mdx.ctcTakeHome.tax")}
            value={rupees(result.tax)}
          />
        </>
      }
    />
  )
}
