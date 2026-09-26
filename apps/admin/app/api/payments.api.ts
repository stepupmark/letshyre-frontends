import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export interface PaymentDashboardCards {
  total_payments: number;
  pending_payments: number;
  success_payments: number;
  failed_payments: number;
  repeated_customers: number;
}

export interface PaymentRecord {
  id: string;
  employeer: string;
  employeer_id:string;
  company: string;
  tokens_credited: number;
  available_tokens: number;
  candidates_selected: number;
  rate_per_candidate: string;
  amount_paid: string;
  currency: string;
  promo_code: string | null;
  discount_amount: string;
  gst_amount: string;
  total_with_gst: string;
  channel_domain: string;
  payment_status: string;
  is_paid: boolean;
  paid_at: string | null;
  transaction_id: string | null;
  payment_order_id: string;
  order_signature: string;
  invoice_number: string | null;
  order_data: unknown;
  response_data: unknown;
  invoice_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPayments {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: PaymentRecord[];
}

export const fetchPaymentCards = async (): Promise<PaymentDashboardCards> => {
  try {
    const response = await http.get("payment/v1/payments/dashboard/cards/");
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export interface FetchPaymentHistoryParams {
  page?: number;
  payment_status?: string;
  min_amount?: string;
  max_amount?: string;
  start_date?: string;
  end_date?: string;
  company?: string;
  search?: string;
}

export const fetchPaymentHistory = async (
  params: FetchPaymentHistoryParams
): Promise<PaginatedPayments> => {
  const { page = 1, payment_status, min_amount, max_amount, start_date, end_date, company, search } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  
  if (payment_status && payment_status !== "ALL") queryParams.append("payment_status", payment_status);
  if (min_amount) queryParams.append("min_amount", min_amount);
  if (max_amount) queryParams.append("max_amount", max_amount);
  if (start_date) queryParams.append("start_date", start_date);
  if (end_date) queryParams.append("end_date", end_date);
  if (company) queryParams.append("company", company);
  if (search) queryParams.append("search", search);
  
  const url = `payment/v1/employer/payments/history/?${queryParams.toString()}`;

  try {
    const response = await http.get(url);
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};
