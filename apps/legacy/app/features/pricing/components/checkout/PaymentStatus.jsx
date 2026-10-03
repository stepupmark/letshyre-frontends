import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { formatAmount } from "@/features/pricing/lib/plans";

const HEADER = "items-center gap-2 text-center sm:text-center";
const TITLE = "text-xl leading-tight font-bold text-text-main";
const DESCRIPTION = "max-w-sm text-sm leading-relaxed text-text-muted";
const PRIMARY = "h-11 w-full rounded-sm font-semibold no-underline hover:bg-brand-700";
const SECONDARY = "h-11 w-full rounded-sm border-border font-semibold text-text-main no-underline";
const FOOTER = "flex-col gap-2 sm:flex-col";

function Reference({ id }) {
  const { t } = useTranslation("pricing");

  return (
    <dl className="flex flex-wrap items-baseline justify-center gap-x-2 text-xs text-text-muted">
      <dt>{t("checkout.reference")}</dt>
      <dd className="font-mono text-text-main select-all">{id}</dd>
    </dl>
  );
}

export function PaymentStatus({ item, checkout }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const { stage } = checkout;

  if (stage.name === "verifying") {
    return (
      <DialogHeader className={`${HEADER} py-6`}>
        <Spinner className="mb-2 size-8 text-brand-600" />
        <DialogTitle className={TITLE}>{t("checkout.verifying.title")}</DialogTitle>
        <DialogDescription className={DESCRIPTION}>{t("checkout.verifying.body")}</DialogDescription>
      </DialogHeader>
    );
  }

  const { order, response } = stage.payment;

  if (stage.name === "paid") {
    return (
      <>
        <DialogHeader className={`${HEADER} pt-2`}>
          <CircleCheck aria-hidden="true" strokeWidth={1.75} className="mb-2 size-12 text-success" />
          <DialogTitle className={TITLE}>{t("checkout.paid.title", { count: item.credits })}</DialogTitle>
          <DialogDescription className={DESCRIPTION}>
            {t("checkout.paid.body", { amount: formatAmount(lang, order.amount) })}
          </DialogDescription>
        </DialogHeader>
        <Reference id={response.razorpay_payment_id} />
        <DialogFooter className={FOOTER}>
          <Button asChild size="lg" className={PRIMARY}>
            <Link to="/employer/candidate-pool">{t("checkout.paid.primary")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className={SECONDARY}>
            <Link to="/employer/invoice">{t("checkout.paid.secondary")}</Link>
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader className={`${HEADER} pt-2`}>
        <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mb-2 size-12 text-warning" />
        <DialogTitle className={TITLE}>{t("checkout.unconfirmed.title")}</DialogTitle>
        <DialogDescription className={DESCRIPTION}>{t("checkout.unconfirmed.body")}</DialogDescription>
      </DialogHeader>
      <Reference id={response.razorpay_payment_id} />
      <DialogFooter className={FOOTER}>
        <Button type="button" size="lg" onClick={checkout.retryConfirm} className={PRIMARY}>
          {t("checkout.unconfirmed.retry")}
        </Button>
        <Button asChild size="lg" variant="outline" className={SECONDARY}>
          <Link to={localePath(lang, "/contact")}>{t("checkout.unconfirmed.contact")}</Link>
        </Button>
      </DialogFooter>
    </>
  );
}
