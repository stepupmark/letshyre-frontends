import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "../api/coupons.api";

export const useCoupons = (page: number = 1) => {
  return useQuery({
    queryKey: ["coupons", page],
    queryFn: () => fetchCoupons(page),
  });
};

const extractMessageFromObject = (obj: any): string | null => {
  if (typeof obj === "string") return obj;
  if (!obj || typeof obj !== "object") return null;

  if (obj.message) {
    const msg = extractMessageFromObject(obj.message);
    if (msg) return msg;
  }

  if (obj.detail) {
    if (typeof obj.detail === "string") return obj.detail;
  }

  const firstKey = Object.keys(obj)[0];
  if (firstKey) {
    const firstError = obj[firstKey];
    if (Array.isArray(firstError) && typeof firstError[0] === "string") {
      return firstError[0];
    }
    if (typeof firstError === "string") {
      return firstError;
    }
    const deepMsg = extractMessageFromObject(firstError);
    if (deepMsg) return deepMsg;
  }

  return null;
};

const getErrorMessage = (error: any, defaultMessage: string) => {
  if (!error?.response?.data) return defaultMessage;

  let data = error.response.data;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return data;
    }
  }

  const extracted = extractMessageFromObject(data);
  return extracted || defaultMessage;
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponPayload) => createCoupon(data),
    onSuccess: () => {
      toast.success("Coupon created successfully.");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to create coupon."), {
        duration: 3000,
      });
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
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to update coupon."), {
        duration: 3000,
      });
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
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to delete coupon."), {
        duration: 3000,
      });
    },
  });
};
