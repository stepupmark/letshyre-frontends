import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "flat" | "percentage";
  discount_value: string;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface CouponsData {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Coupon[];
}

export interface CouponsApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CouponsData;
}

export interface CouponApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: Coupon;
}

export interface DeleteCouponApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: Record<string, never>;
}

export interface CreateCouponPayload {
  code: string;
  discount_type: "flat" | "percentage";
  discount_value: string;
  usage_limit: number;
  start_date: string;
  end_date: string;
}

export interface UpdateCouponPayload {
  code?: string;
  discount_type?: "flat" | "percentage";
  discount_value?: string;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
}

export const fetchCoupons = async (page: number = 1): Promise<CouponsData> => {
  try {
    const response = await http.get<CouponsApiResponse>(
      `/user/v1/admin/coupon/management/?page=${page}`,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const createCoupon = async (
  data: CreateCouponPayload,
): Promise<Coupon> => {
  try {
    const response = await http.post<CouponApiResponse>(
      `/user/v1/admin/coupon/management/`,
      data,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const updateCoupon = async (
  id: string,
  data: UpdateCouponPayload,
): Promise<Coupon> => {
  try {
    const response = await http.put<CouponApiResponse>(
      `/user/v1/admin/coupon/detail/${id}/`,
      data,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const deleteCoupon = async (id: string): Promise<void> => {
  try {
    await http.delete<DeleteCouponApiResponse>(
      `/user/v1/admin/coupon/detail/${id}/`,
    );
  } catch (err) {
    throw toApiError(err);
  }
};
