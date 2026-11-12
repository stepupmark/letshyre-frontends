import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { useRupees } from "../../../hooks/use-rupees"
import { numberOf, offerYearOne } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolMoneyField, ToolResult } from "./tool-frame"

function useOffer(ctc: string, variable: string, bonus: string) {
  const [state, setState] = useState({ ctc, variable, bonus })
  const result = offerYearOne({
    ctc: numberOf(state.ctc),
    variableShare: numberOf(state.variable) / 100,
    joiningBonus: numberOf(state.bonus),
  })
  const set = (field: keyof typeof state) => (value: string) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }
  return { state, set, yearOne: result.yearOne }
}

export default function OfferCompare() {
  const { t } = useTranslation("blog")
  const money = useRupees()
  const offers = {
    A: useOffer("2400000", "15", "0"),
    B: useOffer("2200000", "0", "200000"),
  }
  const gap = offers.A.yearOne - offers.B.yearOne
  const ahead = gap >= 0 ? "A" : "B"

  return (
    <ToolFrame
      title={t("mdx.offerCompare.title")}
      note={t("mdx.offerCompare.note")}
      fields={(["A", "B"] as const).map((offer) => {
        const { state, set } = offers[offer]
        return (
          <OfferFields
            key={offer}
            labels={{
              ctc: t("mdx.offerCompare.ctc", { offer }),
              variable: t("mdx.offerCompare.variable", { offer }),
              bonus: t("mdx.offerCompare.bonus", { offer }),
            }}
            state={state}
            set={set}
          />
        )
      })}
      results={
        <>
          <ToolResult
            label={t("mdx.offerCompare.yearOne", { offer: "A" })}
            value={money(offers.A.yearOne)}
          />
          <ToolResult
            label={t("mdx.offerCompare.yearOne", { offer: "B" })}
            value={money(offers.B.yearOne)}
          />
          <ToolResult
            label={t("mdx.offerCompare.more")}
            value={
              Math.abs(gap) < 1
                ? t("mdx.offerCompare.even")
                : t("mdx.offerCompare.ahead", {
                    offer: ahead,
                    amount: money(Math.abs(gap)),
                  })
            }
          />
        </>
      }
    />
  )
}

function OfferFields({
  labels,
  state,
  set,
}: {
  labels: { ctc: string; variable: string; bonus: string }
  state: { ctc: string; variable: string; bonus: string }
  set: (field: "ctc" | "variable" | "bonus") => (value: string) => void
}) {
  return (
    <>
      <ToolMoneyField
        label={labels.ctc}
        value={state.ctc}
        onValueChange={set("ctc")}
      />
      <ToolField
        label={labels.variable}
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        value={state.variable}
        onChange={(event) => {
          set("variable")(event.target.value)
        }}
      />
      <ToolMoneyField
        label={labels.bonus}
        value={state.bonus}
        onValueChange={set("bonus")}
      />
    </>
  )
}
