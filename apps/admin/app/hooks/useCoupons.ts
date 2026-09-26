import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CreateCouponPayload,
  type UpdateCouponPayload,
} from "../api/coupons.api";
import { getErrorMessage } from "~/lib/api/api-error";

export const useCoupons = (page: number = 1) => {
  return useQuery({
    queryKey: ["coupons", page],
    queryFn: () => fetchCoupons(page),
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponPayload) => createCoupon(data),
    onSuccess: () => {
      toast.success("Coupon created successfully.");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create coupon."));
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponPayload }) =>
      updateCoupon(id, data),
    onSuccess: () => {
      toast.success("Coupon updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update coupon."));
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      toast.success("Coupon deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete coupon."));
    },
  });
};
