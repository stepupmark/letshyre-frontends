import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { ctcTakeHome, numberOf } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

export default function CtcTakeHome() {
  const { t } = useTranslation("blog")
  const money = useRupees()
  const [ctc, setCtc] = useState("2000000")
  const [variable, setVariable] = useState("10")
  const [basic, setBasic] = useState("50")
  const result = ctcTakeHome({
    ctc: numberOf(ctc),
    variableShare: numberOf(variable) / 100,
    basicShare: numberOf(basic) / 100,
  })
  const rupees = (value: number) => money(Math.max(0, value))

  return (
    <ToolFrame
      title={t("mdx.ctcTakeHome.title")}
      note={t("mdx.ctcTakeHome.note")}
      fields={
        <>
          <ToolMoneyField
            label={t("mdx.ctcTakeHome.ctc")}
            value={ctc}
            onValueChange={setCtc}
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
