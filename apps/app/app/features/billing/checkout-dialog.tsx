import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { useQuery } from "@tanstack/react-query"
import {
  CircleAlert,
  CircleCheck,
  LockKeyhole,
  RotateCw,
  TicketPercent,
  X,
} from "lucide-react"
import * as m from "motion/react-m"
import { useId, useState, type ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"
import { duration, ease } from "@/lib/motion"
import { sitePage } from "@/lib/site"

import type { Quote } from "./api"
import type { CheckoutItem } from "./checkout"
import { formatRupees } from "./money"
import { useCheckout, type Checkout, type Notice } from "./use-checkout"

const REVIEW = new Set(["review", "paying", "razorpay"])

export function CheckoutDialog({
  item,
  next,
  onClose,
}: {
  item: CheckoutItem
  /** where "Back" goes after paying, e.g. the candidate that needed credits */
  next: string | null
  onClose: () => void
}) {
  const checkout = useCheckout(item)
  const { stage, busy } = checkout

  // hidden while Razorpay is open: the dialog's focus trap would lock its iframe
  return (
    <Dialog
      open={stage.name !== "razorpay"}
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto sm:max-w-md"
      >
        {REVIEW.has(stage.name) ? (
          <Review item={item} checkout={checkout} />
        ) : (
          <Outcome item={item} checkout={checkout} next={next} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function Review({
  item,
  checkout,
}: {
  item: CheckoutItem
  checkout: Checkout
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const { quote, stage } = checkout
  const paying = stage.name === "paying" || stage.name === "razorpay"
  const notice = stage.name === "review" ? stage.notice : undefined

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {item.kind === "plan"
            ? t("checkout.planTitle", { name: item.plan.name })
            : t("checkout.topUpTitle", { count: item.credits })}
        </DialogTitle>
        <DialogDescription>
          {t("checkout.summary", { count: item.credits })}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {quote.isError && !quote.data ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>{t("checkout.quoteError")}</AlertTitle>
            <AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={quote.isFetching}
                onClick={() => void quote.refetch()}
              >
                <RotateCw />
                {t("checkout.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Breakdown quote={quote.data} coupon={checkout.coupon} />
        )}
        {quote.data && <Coupon checkout={checkout} />}
        {notice && <NoticeAlert notice={notice} />}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-col">
        <Button
          size="lg"
          onClick={checkout.pay}
          disabled={!quote.data || quote.isPlaceholderData || paying}
        >
          {paying ? <Spinner /> : <LockKeyhole />}
          {paying
            ? t("checkout.paying")
            : quote.data
              ? t("checkout.pay", {
                  amount: formatRupees(locale, quote.data.total),
                })
              : t("checkout.payPending")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <Trans
            t={t}
            i18nKey="checkout.secure"
            components={{
              terms: <Legal href={sitePage(locale, "/terms")} />,
              refund: <Legal href={sitePage(locale, "/refund-policy")} />,
            }}
          />
        </p>
      </DialogFooter>
    </>
  )
}

function Legal({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-foreground"
    >
      {children}
    </a>
  )
}

function Breakdown({
  quote,
  coupon,
}: {
  quote: Quote | undefined
  coupon: string | null
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  if (!quote)
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4" aria-busy>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-6 w-1/3" />
      </div>
    )
  const money = (n: number) => formatRupees(locale, n)
  return (
    <dl className="flex flex-col gap-2 rounded-lg border p-4 text-sm tabular-nums">
      <Line
        label={t("checkout.credits", {
          count: quote.credits,
          rate: money(quote.rate),
        })}
        value={money(quote.subtotal)}
      />
      {quote.discount > 0 && (
        <Line
          label={
            coupon
              ? t("checkout.couponLine", { code: coupon })
              : t("checkout.discount")
          }
          value={`−${money(quote.discount)}`}
          tone="success"
        />
      )}
      <Line
        label={t("checkout.gst", { percent: quote.gstPercent })}
        value={money(quote.gst)}
      />
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-3">
        <dt className="font-medium">{t("checkout.total")}</dt>
        <dd className="text-lg font-semibold">{money(quote.total)}</dd>
      </div>
    </dl>
  )
}

function Line({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "success"
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "success" ? "text-success" : undefined}>
        {value}
      </dd>
    </div>
  )
}

const COUPON = /^[A-Za-z0-9_-]{1,32}$/

function Coupon({ checkout }: { checkout: Checkout }) {
  const { t } = useTranslation("billing")
  const id = useId()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const shown = error ?? checkout.rejected

  if (checkout.coupon)
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-success-muted px-3 py-2 text-sm text-success">
        <span className="flex items-center gap-2">
          <TicketPercent className="size-4" aria-hidden="true" />
          {t("checkout.coupon.applied", { code: checkout.coupon })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("checkout.coupon.remove", { code: checkout.coupon })}
          onClick={() => {
            setCode("")
            checkout.applyCoupon(null)
          }}
        >
          <X />
        </Button>
      </div>
    )

  if (!open)
    return (
      <Button
        variant="link"
        className="self-start px-0"
        onClick={() => {
          setOpen(true)
        }}
      >
        {t("checkout.coupon.toggle")}
      </Button>
    )

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = code.trim()
        if (!COUPON.test(value)) {
          setError(
            value ? t("checkout.coupon.invalid") : t("checkout.coupon.required")
          )
          return
        }
        setError(null)
        checkout.applyCoupon(value.toUpperCase())
      }}
    >
      <Field data-invalid={Boolean(shown)}>
        <FieldLabel htmlFor={id}>{t("checkout.coupon.label")}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={id}
            value={code}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={Boolean(shown)}
            aria-describedby={shown ? `${id}-error` : undefined}
            onChange={(event) => {
              setCode(event.target.value)
            }}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={checkout.quote.isFetching}
          >
            {t("checkout.coupon.apply")}
          </Button>
        </div>
        <FieldError id={`${id}-error`}>{shown}</FieldError>
      </Field>
    </form>
  )
}

function NoticeAlert({ notice }: { notice: Notice }) {
  const { t } = useTranslation("billing")
  const detail = "detail" in notice ? notice.detail : null
  return (
    <Alert variant={notice.kind === "priceChanged" ? "default" : "destructive"}>
      <CircleAlert />
      <AlertTitle>{t(`checkout.notice.${notice.kind}.title`)}</AlertTitle>
      <AlertDescription>
        {detail ?? t(`checkout.notice.${notice.kind}.body`)}
      </AlertDescription>
    </Alert>
  )
}

function Outcome({
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
          to={next ?? "/employer/candidate-pool"}
          className={buttonLink({ size: "lg" })}
        >
          {next ? t("checkout.paid.back") : t("checkout.paid.primary")}
        </AppLink>
        <AppLink
          to="/employer/invoice"
          className={buttonLink({ variant: "outline", size: "lg" })}
        >
          {t("checkout.paid.invoices")}
        </AppLink>
      </DialogFooter>
    </>
  )
}
