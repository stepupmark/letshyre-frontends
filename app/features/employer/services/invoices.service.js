import api from "@/services/api";
import { invoiceRowSchema, invoicesResponseSchema } from "@/features/employer/schemas/invoices.schema";

export class InvalidInvoicesError extends Error {
  name = "InvalidInvoicesError";
}

// Relative paths resolve against the API; anything that isn't http(s) is dropped.
function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, import.meta.env.VITE_API_BASE_URL || window.location.origin);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

const toInvoice = (row) => ({
  id: row.id,
  invoiceNumber: row.invoice_number || null,
  paidAt: row.paid_at || row.created_at,
  planName: row.credit_plan?.name ?? null,
  credits: row.tokens_credited,
  subtotal: row.base_amount,
  discount: row.discount_amount,
  couponCode: row.coupon?.code || row.promo_code || null,
  gst: row.gst_amount,
  total: row.total_with_gst,
  paymentRef: row.transaction_id || null,
  invoiceUrl: safeUrl(row.invoice_file),
});

// Paid purchases only: an abandoned checkout isn't an invoice.
export const getInvoices = async ({ page = 1 } = {}) => {
  const res = await api.get("/payment/v1/credit_purchase_history/", {
    params: { page, is_paid: true },
  });

  const parsed = invoicesResponseSchema.safeParse(res.data);
  if (!parsed.success) throw new InvalidInvoicesError("Unexpected invoice history response");

  const { results, total_pages: totalPages, current_page: currentPage } = parsed.data.data;
  const invoices = results.flatMap((item) => {
    const row = invoiceRowSchema.safeParse(item);
    return row.success ? [toInvoice(row.data)] : [];
  });

  return { invoices, totalPages, currentPage: currentPage ?? page };
};
