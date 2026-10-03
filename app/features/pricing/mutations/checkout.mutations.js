import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { createOrder, verifyPayment } from "@/features/pricing/services/checkout.service";
import { quoteQuery } from "@/features/pricing/queries/checkout.queries";

// Resolves with the coupon's quote, which also lands in the cache so the
// summary switches to it without a second request.
export const useApplyCoupon = ({ planId, tokens }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponCode) => queryClient.fetchQuery(quoteQuery({ planId, tokens, couponCode })),
  });
};

export const useCreateOrder = () => useMutation({ mutationFn: createOrder });

const isTransient = (error) => !error?.response || error.response.status >= 500;

// The payer has already been charged by the time this runs, so a dropped
// connection is worth a few retries before giving up.
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPayment,
    retry: (failureCount, error) => failureCount < 3 && isTransient(error),
    onSuccess: (data) => {
      if (!data?.success) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.employer.credits() });
      queryClient.invalidateQueries({ queryKey: queryKeys.employer.dashboardStats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.invoices() });
    },
  });
};
