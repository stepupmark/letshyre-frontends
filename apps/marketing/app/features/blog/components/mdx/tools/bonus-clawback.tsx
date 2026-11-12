import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { bonusClawback, numberOf } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

export default function BonusClawback() {
  const { t } = useTranslation("blog")
  const money = useRupees()
  const [ctc, setCtc] = useState("2400000")
  const [bonus, setBonus] = useState("200000")
  const [months, setMonths] = useState("9")
  const result = bonusClawback({
    ctc: numberOf(ctc),
    bonus: numberOf(bonus),
    monthsStayed: numberOf(months),
  })

  return (
    <ToolFrame
      title={t("mdx.bonusClawback.title")}
      note={t("mdx.bonusClawback.note")}
      fields={
        <>
          <ToolMoneyField
            label={t("mdx.bonusClawback.ctc")}
            value={ctc}
            onValueChange={setCtc}
          />
          <ToolMoneyField
            label={t("mdx.bonusClawback.bonus")}
            value={bonus}
            onValueChange={setBonus}
          />
          <ToolField
            label={t("mdx.bonusClawback.months")}
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            value={months}
            onChange={(event) => {
              setMonths(event.target.value)
            }}
          />
        </>
      }
      results={
        <>
          <ToolResult
            label={t("mdx.bonusClawback.inHand")}
            value={money(result.inHand)}
          />
          <ToolResult
            label={t("mdx.bonusClawback.prorated")}
            value={money(result.prorated)}
          />
          <ToolResult
            label={t("mdx.bonusClawback.full")}
            value={money(result.full)}
          />
        </>
      }
    />
  )
}
