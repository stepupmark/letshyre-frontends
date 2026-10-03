import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clearAuth } from "@/lib/authStorage";
import { getStoredUser } from "@/lib/getUser";
import { trackEvent } from "@/lib/metaPixel";
import { quoteQuery } from "@/features/pricing/queries/checkout.queries";
import { useCreateOrder, useVerifyPayment } from "@/features/pricing/mutations/checkout.mutations";
import { resolveBuyer, toPaise } from "@/features/pricing/lib/checkout";
import { loadRazorpay, openRazorpay } from "@/features/pricing/lib/razorpay";

const BRAND_COLOR = "#2563eb";

const statusOf = (error) => error?.response?.status;

function prefill() {
  const user = getStoredUser();
  const fields = {
    name: user.full_name ?? user.name,
    email: user.email,
    contact: user.phone_number ?? user.phone,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => typeof value === "string" && value),
  );
}

function failureNotice(error) {
  if (error?.name === "RazorpayLoadError") return { kind: "blocked" };
  const message = error?.response?.data?.message ?? error?.serverMessage;
  return { kind: "error", detail: typeof message === "string" && message ? message : null };
}

// Stages: review → paying → razorpay → verifying → paid | unconfirmed.
// Leaving Razorpay without paying goes back to review with a notice.
export function useCheckout(item) {
  const { t } = useTranslation("pricing");
  const queryClient = useQueryClient();
  const [buyer, setBuyer] = useState(resolveBuyer);
  const [couponCode, setCouponCode] = useState(null);
  const [stage, setStage] = useState({ name: "review" });
  const placedOrder = useRef(null);
  const paying = useRef(false);

  const base = { planId: item.planId, tokens: item.credits };
  const quote = useQuery({
    ...quoteQuery({ ...base, couponCode }),
    enabled: buyer === "employer",
    placeholderData: keepPreviousData,
  });
  const createOrder = useCreateOrder();
  const verify = useVerifyPayment();

  const signedOut = statusOf(quote.error) === 401;
  const gate = buyer !== "employer" ? buyer : signedOut ? "guest" : null;
  const coupon = couponCode && quote.data?.coupon?.applied ? quote.data.coupon : null;
  const busy = stage.name === "paying" || stage.name === "verifying";

  useEffect(() => {
    if (signedOut) clearAuth();
  }, [signedOut]);

  useEffect(() => {
    if (buyer === "employer") loadRazorpay().catch(() => {});
  }, [buyer]);

  useEffect(() => {
    if (stage.name !== "verifying") return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [stage.name]);

  const confirm = async (payment) => {
    setStage({ name: "verifying", payment });
    try {
      const result = await verify.mutateAsync({
        razorpay_payment_id: payment.response.razorpay_payment_id,
        razorpay_order_id: payment.response.razorpay_order_id,
        razorpay_signature: payment.response.razorpay_signature,
        purchase_id: payment.order.purchaseId,
      });
      if (!result?.success) throw new Error("Payment not verified");

      trackEvent(
        "Purchase",
        { value: payment.order.amount, currency: payment.order.currency },
        payment.response.razorpay_payment_id,
      );
      setStage({ name: "paid", payment });
    } catch {
      setStage({ name: "unconfirmed", payment });
    }
  };

  const pay = async () => {
    if (paying.current || !quote.data || quote.isPlaceholderData) return;
    paying.current = true;

    const total = toPaise(quote.data.total);
    const request = { ...base, couponCode: coupon ? couponCode : undefined };
    const signature = [request.planId, request.tokens, request.couponCode, total].join("|");
    setStage({ name: "paying" });

    try {
      const razorpay = loadRazorpay();
      razorpay.catch(() => {});

      // Paying again after closing Razorpay reuses the order rather than
      // leaving an unpaid one behind for every attempt.
      if (placedOrder.current?.signature !== signature) {
        placedOrder.current = { signature, order: await createOrder.mutateAsync(request) };
      }
      const { order } = placedOrder.current;

      if (toPaise(order.amount) !== total) {
        placedOrder.current = null;
        await queryClient.invalidateQueries({ queryKey: quoteQuery({ ...base, couponCode }).queryKey });
        setStage({ name: "review", notice: { kind: "priceChanged" } });
        return;
      }

      const Razorpay = await razorpay;
      setStage({ name: "razorpay" });
      trackEvent(
        "InitiateCheckout",
        { value: order.amount, currency: order.currency, num_items: base.tokens },
        order.orderId,
      );

      const result = await openRazorpay(Razorpay, {
        key: order.key,
        order_id: order.orderId,
        currency: order.currency,
        name: "LetsHyre",
        description: t("checkout.razorpay", { count: base.tokens }),
        prefill: prefill(),
        notes: { purchase_id: order.purchaseId },
        theme: { color: BRAND_COLOR },
      });

      if (!result.paid) {
        setStage({
          name: "review",
          notice: result.failure
            ? { kind: "failed", detail: result.failure.description ?? null }
            : { kind: "cancelled" },
        });
        return;
      }

      placedOrder.current = null;
      await confirm({ order, response: result.response });
    } catch (error) {
      if (statusOf(error) === 401) {
        clearAuth();
        setBuyer("guest");
        setStage({ name: "review" });
        return;
      }
      setStage({ name: "review", notice: failureNotice(error) });
    } finally {
      paying.current = false;
    }
  };

  return {
    gate,
    base,
    quote,
    coupon,
    stage,
    busy,
    pay,
    applyCoupon: (code) => {
      setCouponCode(code);
      setStage({ name: "review" });
    },
    removeCoupon: () => {
      setCouponCode(null);
      setStage({ name: "review" });
    },
    retryConfirm: () => {
      if (stage.name === "unconfirmed") confirm(stage.payment);
    },
  };
}
