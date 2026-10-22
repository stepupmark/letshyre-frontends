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
import { Spinner } from "@workspace/ui/components/spinner"
import { CircleAlert, LockKeyhole, RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { sitePage } from "@/lib/site"

import type { CheckoutItem } from "../../lib/checkout"
import { formatRupees } from "../../lib/money"
import {
  useCheckout,
  type Checkout,
  type Notice,
} from "../../mutations/use-checkout"
import { Breakdown } from "./breakdown"
import { Coupon } from "./coupon"
import { Outcome } from "./outcome"

const REVIEW = new Set(["review", "paying", "razorpay"])

export function CheckoutDialog({
  item,
  next,
  onClose,
}: {
  item: CheckoutItem
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
