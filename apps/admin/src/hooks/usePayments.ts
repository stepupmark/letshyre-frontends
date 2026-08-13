import { useQuery } from "@tanstack/react-query";
import {
  fetchPaymentCards,
  fetchPaymentHistory,
  FetchPaymentHistoryParams,
} from "../api/payments.api";

export const usePaymentCards = () => {
  return useQuery({
    queryKey: ["paymentCards"],
    queryFn: fetchPaymentCards,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePaymentHistory = (params: FetchPaymentHistoryParams) => {
  return useQuery({
    queryKey: ["paymentHistory", params],
    queryFn: () => fetchPaymentHistory(params),
    staleTime: 60 * 1000, // 1 minute
  });
};
