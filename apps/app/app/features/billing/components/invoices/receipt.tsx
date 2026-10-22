import { useLocale, useTranslation } from "@workspace/i18n/react"
import { FileDown } from "lucide-react"
import * as m from "motion/react-m"

import { CopyButton } from "@/components/copy-button"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import { formatRupees } from "../../lib/money"
import type { Invoice } from "../../schemas/billing.schema"

export function Purchase({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium underline-offset-4 group-hover:underline">
        {invoice.plan
          ? t("invoiceList.plan", { name: invoice.plan })
          : t("invoiceList.topUp")}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {t("topUps.credits", { count: invoice.credits })}
      </span>
    </span>
  )
}

export function Pdf({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  if (!invoice.pdf)
    return (
      <span className="text-muted-foreground">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t("invoiceList.preparing")}</span>
      </span>
    )
  return (
    <a
      href={invoice.pdf}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonLink({ variant: "outline", size: "sm" })}
    >
      <FileDown />
      {t("receipt.pdf")}
    </a>
  )
}

export function Receipt({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const money = (n: number) => formatRupees(locale, n)
  const paid = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(invoice.paidAt))

  return (
    <m.div
      key={invoice.id}
      data-print=""
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col gap-6"
    >
      <Purchase invoice={invoice} />
      <dl className="flex flex-col gap-2 tabular-nums">
        <Row label={t("receipt.subtotal")} value={money(invoice.subtotal)} />
        {invoice.discount > 0 && (
          <Row
            label={
              invoice.coupon
                ? t("checkout.couponLine", { code: invoice.coupon })
                : t("checkout.discount")
            }
            value={`−${money(invoice.discount)}`}
          />
        )}
        <Row label={t("receipt.gst")} value={money(invoice.gst)} />
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-3">
          <dt className="font-medium">{t("checkout.total")}</dt>
          <dd className="text-lg font-semibold">{money(invoice.total)}</dd>
        </div>
      </dl>
      <dl className="flex flex-col gap-2">
        <Row label={t("receipt.paidOn")} value={paid} />
        {invoice.number && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">
              {t("invoiceList.columns.number")}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-xs select-all">
                {invoice.number}
              </span>
              <span className="print:hidden">
                <CopyButton value={invoice.number} />
              </span>
            </dd>
          </div>
        )}
        {invoice.reference && (
          <Row label={t("checkout.reference")} value={invoice.reference} mono />
        )}
      </dl>
      {!invoice.pdf && (
        <p className="text-pretty text-muted-foreground">
          {t("receipt.noPdf")}
        </p>
      )}
    </m.div>
  )
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={mono ? "font-mono text-xs break-all select-all" : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
