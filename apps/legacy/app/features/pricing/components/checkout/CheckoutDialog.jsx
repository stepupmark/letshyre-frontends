import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { usePlans } from "@/features/pricing/hooks/usePlans";
import { useCheckout } from "@/features/pricing/hooks/useCheckout";
import { CHECKOUT_PARAM, findCheckoutItem } from "@/features/pricing/lib/checkout";
import { BuyerGate } from "@/features/pricing/components/checkout/BuyerGate";
import { OrderReview } from "@/features/pricing/components/checkout/OrderReview";
import { OrderSummary } from "@/features/pricing/components/checkout/OrderSummary";
import { PaymentStatus } from "@/features/pricing/components/checkout/PaymentStatus";

const CONTENT =
  "max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-lg border-border p-6 sm:max-w-md";
const REVIEW_STAGES = new Set(["review", "paying", "razorpay"]);

function Checkout({ item, onClose }) {
  const checkout = useCheckout(item);
  const { stage, gate, busy } = checkout;

  // Hidden while Razorpay is open: the dialog's focus trap and pointer lock
  // would otherwise make Razorpay's iframe unusable.
  return (
    <Dialog open={stage.name !== "razorpay"} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent showCloseButton={!busy} className={CONTENT}>
        {gate ? (
          <BuyerGate gate={gate} item={item} onClose={onClose} />
        ) : REVIEW_STAGES.has(stage.name) ? (
          <OrderReview item={item} checkout={checkout} />
        ) : (
          <PaymentStatus item={item} checkout={checkout} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CheckoutUnavailable({ status, onRetry, isRetrying, onClose }) {
  const { t } = useTranslation("pricing");
  const pending = status === "loading" || status === "slow";
  const failed = !pending && status !== "ready";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={CONTENT}>
        {pending ? (
          <>
            <DialogHeader className="gap-2">
              <DialogTitle className="sr-only">{t("checkout.loading.title")}</DialogTitle>
              <DialogDescription className="sr-only">{t("checkout.loading.body")}</DialogDescription>
              <Skeleton aria-hidden="true" className="h-6 w-40 rounded-sm" />
              <Skeleton aria-hidden="true" className="h-4 w-64 max-w-full rounded-sm" />
            </DialogHeader>
            <OrderSummary />
          </>
        ) : (
          <>
            <DialogHeader className="gap-1.5 pe-8 text-start sm:text-start">
              <DialogTitle className="text-xl leading-tight font-bold text-text-main">
                {failed ? t("checkout.plansError.title") : t("checkout.unavailable.title")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-text-muted">
                {failed ? t("checkout.plansError.body") : t("checkout.unavailable.body")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {failed && (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => !isRetrying && onRetry()}
                  aria-disabled={isRetrying}
                  className="h-11 w-full gap-2 rounded-sm font-semibold hover:bg-brand-700 aria-disabled:cursor-wait"
                >
                  {isRetrying ? <Spinner /> : <RotateCw aria-hidden="true" />}
                  {t("checkout.retry")}
                </Button>
              )}
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onClose}
                className="h-11 w-full rounded-sm border-border font-semibold text-text-main"
              >
                {t("checkout.close")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// The open checkout lives in the URL (?checkout=business, ?checkout=25-credits),
// so it survives sign-in, and the back button closes it.
export function CheckoutDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { status, plans, retry, isRetrying } = usePlans();
  const key = searchParams.get(CHECKOUT_PARAM);

  if (!key) return null;

  const close = () => {
    if (location.state?.checkout) {
      navigate(-1);
      return;
    }
    setSearchParams(
      (params) => {
        params.delete(CHECKOUT_PARAM);
        return params;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const item = findCheckoutItem(key, plans);
  if (item) return <Checkout key={key} item={item} onClose={close} />;

  return <CheckoutUnavailable status={status} onRetry={retry} isRetrying={isRetrying} onClose={close} />;
}
