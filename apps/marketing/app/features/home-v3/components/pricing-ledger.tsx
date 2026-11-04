import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useRef } from "react"

import { settled } from "./scene-context"
import { useStill } from "./use-still"

export function PricingLedger() {
  const ref = useRef<HTMLTableElement>(null)
  const still = useStill(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  return (
    <table ref={ref} className="mt-8 w-full text-start text-sm sm:text-base">
      {/* transforms stay bound to the first value, so a switch remounts */}
      <Rows
        key={still ? "still" : "live"}
        progress={still ? settled : scrollYProgress}
      />
    </table>
  )
}

function Rows({ progress }: { progress: MotionValue<number> }) {
  const { t } = useTranslation("homeV3")
  const rows = t("pricing.ledger.rows", { returnObjects: true })

  return (
    <>
      <caption className="sr-only">{t("pricing.ledger.caption")}</caption>
      <thead>
        <tr className="border-b text-xs text-muted-foreground">
          <th scope="col" className="py-2 text-start font-medium">
            {t("pricing.ledger.columns.entry")}
          </th>
          <th scope="col" className="py-2 text-end font-medium">
            {t("pricing.ledger.columns.credits")}
          </th>
          <th scope="col" className="py-2 text-end font-medium">
            {t("pricing.ledger.columns.balance")}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <Row
            key={row.entry}
            {...row}
            from={0.2 + i * 0.15}
            progress={progress}
          />
        ))}
      </tbody>
    </>
  )
}

function Row({
  entry,
  credits,
  balance,
  from,
  progress,
}: {
  entry: string
  credits: string
  balance: string
  from: number
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, [from, from + 0.12], [0, 1])
  const y = useTransform(opacity, [0, 1], ["0.5rem", "0rem"])

  return (
    <m.tr style={{ opacity, y }} className="border-b">
      <th scope="row" className="py-4 text-start font-medium">
        {entry}
      </th>
      <td className="py-4 text-end text-muted-foreground tabular-nums">
        {credits}
      </td>
      <td className="py-4 text-end text-lg font-semibold tabular-nums">
        {balance}
      </td>
    </m.tr>
  )
}
