import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { CircleAlert, LockKeyhole, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { formatAmount } from "@/features/pricing/lib/plans";
import { CheckoutHeader } from "@/features/pricing/components/checkout/CheckoutHeader";
import { CheckoutNotice } from "@/features/pricing/components/checkout/CheckoutNotice";
import { CouponForm } from "@/features/pricing/components/checkout/CouponForm";
import { OrderSummary } from "@/features/pricing/components/checkout/OrderSummary";

const LEGAL_LINK = "font-medium text-text-body underline underline-offset-2 hover:text-text-main";

function QuoteError({ error, onRetry, isRetrying }) {
  const { t } = useTranslation("pricing");
  const message = error?.response?.status < 500 ? error.response.data?.message : null;

  return (
    <Alert variant="destructive" className="rounded-sm border-border">
      <CircleAlert aria-hidden="true" />
      <AlertTitle className="line-clamp-none font-semibold">{t("checkout.quoteError.title")}</AlertTitle>
      <AlertDescription>
        <p>{typeof message === "string" && message ? message : t("checkout.quoteError.body")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => !isRetrying && onRetry()}
          aria-disabled={isRetrying}
          className="mt-2 gap-2 rounded-sm border-border text-text-main aria-disabled:cursor-wait"
        >
          {isRetrying ? <Spinner /> : <RotateCw aria-hidden="true" />}
          {t("checkout.retry")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function OrderReview({ item, checkout }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const { quote, stage } = checkout;
  const paying = stage.name === "paying" || stage.name === "razorpay";
  const failed = quote.isError && !quote.data;

  return (
    <>
      <CheckoutHeader item={item} />

      <div className="flex flex-col gap-4">
        {failed ? (
          <QuoteError error={quote.error} onRetry={quote.refetch} isRetrying={quote.isFetching} />
        ) : (
          <OrderSummary quote={quote.data} coupon={checkout.coupon} />
        )}
        {quote.data && <CouponForm checkout={checkout} />}
        {stage.notice && <CheckoutNotice notice={stage.notice} />}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-col">
        <Button
          type="button"
          size="lg"
          onClick={checkout.pay}
          disabled={!quote.data}
          aria-disabled={paying}
          className="h-11 w-full gap-2 rounded-sm font-semibold hover:bg-brand-700 aria-disabled:cursor-wait"
        >
          {paying ? <Spinner /> : <LockKeyhole aria-hidden="true" />}
          {paying
            ? t("checkout.paying")
            : quote.data
              ? t("checkout.pay", { amount: formatAmount(lang, quote.data.total) })
              : t("checkout.payPending")}
        </Button>
        <p className="text-center text-xs leading-relaxed text-text-muted">
          <Trans
            t={t}
            i18nKey="checkout.secure"
            components={{
              terms: <Link to={localePath(lang, "/terms")} target="_blank" className={LEGAL_LINK} />,
              refund: <Link to={localePath(lang, "/refund-policy")} target="_blank" className={LEGAL_LINK} />,
            }}
          />
        </p>
      </DialogFooter>
    </>
  );
}
