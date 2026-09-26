import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentGateways,
  addPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  getPaymentGatewayDetail,
} from "../api/paymentGateways.api";

export type Gateway = {
  id: string;
  name: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  isSandbox: boolean;
};

export type AddGatewayPayload = {
  gatewayName: string;
  displayName: string;
  clientId: string;
  clientSecret: string;
  isActive: boolean;
};

export const usePaymentGateways = () => {
  return useQuery<Gateway[]>({
    queryKey: ["gateways"],
    queryFn: getPaymentGateways,
  });
};

export const useAddPaymentGateway = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPaymentGateway,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
    },
  });
};

export const useUpdatePaymentGateway = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentGateway,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
    },
  });
};

export const usePaymentGatewayDetail = (id: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ["payment-gateway-detail", id],
    queryFn: () => getPaymentGatewayDetail(id),

    enabled: isOpen && !!id, // only call when modal opens

    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useDeletePaymentGateway = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaymentGateway(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gateways"],
      });
    },
  });
};
