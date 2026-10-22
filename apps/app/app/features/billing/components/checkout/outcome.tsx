import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import { useQuery } from "@tanstack/react-query"
import { CircleAlert, CircleCheck } from "lucide-react"
import * as m from "motion/react-m"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"
import { duration, ease } from "@/lib/motion"
import { sitePage } from "@/lib/site"

import type { CheckoutItem } from "../../lib/checkout"
import { formatRupees } from "../../lib/money"
import type { Checkout } from "../../mutations/use-checkout"

export function Outcome({
  item,
  checkout,
  next,
}: {
  item: CheckoutItem
  checkout: Checkout
  next: string | null
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const credits = useQuery(creditsQuery())
  const { stage } = checkout

  if (stage.name === "verifying")
    return (
      <DialogHeader className="items-center py-6 text-center">
        <Spinner className="mb-2 size-8" />
        <DialogTitle>{t("checkout.verifying.title")}</DialogTitle>
        <DialogDescription>{t("checkout.verifying.body")}</DialogDescription>
      </DialogHeader>
    )
  if (stage.name !== "paid" && stage.name !== "unconfirmed") return null
  const { order, proof } = stage.payment

  const reference = (
    <dl className="flex flex-wrap items-baseline justify-center gap-x-2 text-xs text-muted-foreground">
      <dt>{t("checkout.reference")}</dt>
      <dd className="font-mono text-foreground select-all">
        {proof.razorpay_payment_id}
      </dd>
    </dl>
  )

  if (stage.name === "unconfirmed")
    return (
      <>
        <DialogHeader className="items-center text-center">
          <CircleAlert
            className="mb-2 size-12 text-warning"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <DialogTitle>{t("checkout.unconfirmed.title")}</DialogTitle>
          <DialogDescription>
            {t("checkout.unconfirmed.body")}
          </DialogDescription>
        </DialogHeader>
        {reference}
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button size="lg" onClick={checkout.retryConfirm}>
            {t("checkout.unconfirmed.retry")}
          </Button>
          <a
            href={sitePage(locale, "/contact")}
            className={buttonLink({ variant: "outline", size: "lg" })}
          >
            {t("checkout.unconfirmed.contact")}
          </a>
        </DialogFooter>
      </>
    )

  return (
    <>
      <DialogHeader className="items-center text-center">
        <m.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: duration.base, ease }}
        >
          <CircleCheck
            className="mb-2 size-12 text-success"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </m.span>
        <DialogTitle>
          {t("checkout.paid.title", { count: item.credits })}
        </DialogTitle>
        <DialogDescription>
          {t("checkout.paid.body", {
            amount: formatRupees(locale, order.amount),
          })}
        </DialogDescription>
      </DialogHeader>
      {credits.data && (
        <p className="text-center text-sm">
          {t("checkout.paid.balance")}{" "}
          <span className="font-semibold tabular-nums">
            <AnimatedNumber
              value={credits.data.available_credits}
              locale={locale}
            />
          </span>
        </p>
      )}
      {reference}
      <DialogFooter className="flex-col gap-2 sm:flex-col">
        <AppLink
          to={next ?? href("/employer/candidates")}
          className={buttonLink({ size: "lg" })}
        >
          {next ? t("checkout.paid.back") : t("checkout.paid.primary")}
        </AppLink>
        <AppLink
          to={href("/employer/invoices")}
          className={buttonLink({ variant: "outline", size: "lg" })}
        >
          {t("checkout.paid.invoices")}
        </AppLink>
      </DialogFooter>
    </>
  )
}
