import { useFormat, useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { numberOf, noticeBuyout } from "../../../lib/tools"
import { ToolField, ToolFrame, ToolResult } from "./tool-frame"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const today = () => new Date().toISOString().slice(0, 10)

export default function NoticeBuyout() {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const [resignedOn, setResignedOn] = useState(today)
  const [noticeDays, setNoticeDays] = useState("90")
  const [monthlyPay, setMonthlyPay] = useState("150000")
  const [joinOn, setJoinOn] = useState("")
  const resigned = ISO_DATE.test(resignedOn) ? resignedOn : today()
  const result = noticeBuyout({
    resignedOn: resigned,
    noticeDays: numberOf(noticeDays),
    monthlyPay: numberOf(monthlyPay),
    joinOn: ISO_DATE.test(joinOn) ? joinOn : undefined,
  })

  return (
    <ToolFrame
      title={t("mdx.noticeBuyout.title")}
      note={t("mdx.noticeBuyout.note")}
      fields={
        <>
          <ToolField
            label={t("mdx.noticeBuyout.resignedOn")}
            type="date"
            value={resignedOn}
            onChange={(event) => {
              setResignedOn(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.noticeBuyout.noticeDays")}
            type="number"
            inputMode="numeric"
            min={0}
            value={noticeDays}
            onChange={(event) => {
              setNoticeDays(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.noticeBuyout.monthlyPay")}
            type="number"
            inputMode="numeric"
            min={0}
            step={5000}
            value={monthlyPay}
            onChange={(event) => {
              setMonthlyPay(event.target.value)
            }}
          />
          <ToolField
            label={t("mdx.noticeBuyout.joinOn")}
            type="date"
            min={resigned}
            value={joinOn}
            onChange={(event) => {
              setJoinOn(event.target.value)
            }}
          />
        </>
      }
      results={
        <>
          <ToolResult
            label={t("mdx.noticeBuyout.freeFrom")}
            value={
              format.date(`${result.freeFrom}T00:00:00Z`, {
                dateStyle: "long",
                timeZone: "UTC",
              }) ?? result.freeFrom
            }
          />
          <ToolResult
            label={t("mdx.noticeBuyout.unserved")}
            value={format.number(result.unserved)}
          />
          <ToolResult
            label={t("mdx.noticeBuyout.buyout")}
            value={format.currency(result.buyout, "INR", {
              maximumFractionDigits: 0,
            })}
          />
        </>
      }
    />
  )
}
