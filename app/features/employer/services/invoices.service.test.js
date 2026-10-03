import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { InvalidInvoicesError, getInvoices } from "./invoices.service";

let handler;
const respond = (config, data) => ({ status: 200, data, config, headers: {} });

const row = (overrides = {}) => ({
  id: "7e119159",
  tokens_credited: 2,
  available_tokens: 2,
  rate_per_candidate: "1.00",
  base_amount: "2.00",
  promo_code: "P0TENOFF2",
  coupon: { id: "c1", code: "P0TENOFF2", discount_type: "percentage", discount_value: "10.00" },
  credit_plan: { id: "p1", name: "Pro", slug: "pro", base_price: "50.00" },
  discount_amount: "0.20",
  gst_amount: "0.36",
  total_with_gst: "2.16",
  payment_status: "Success",
  is_paid: true,
  paid_at: "2026-09-26T10:43:32.784837+05:30",
  transaction_id: "pay_TgXu8P8uEzgLFQ",
  payment_order_id: "order_TgXtqz9kBECyuk",
  order_signature: "ab2e2160a27f9edcbab1cf2b",
  invoice_number: "LETSHYRE-00011",
  order_data: { razorpay_key: "rzp_test_key", order_data: { receipt: "EMP-5be5ff52" } },
  response_data: {},
  invoice_file: null,
  created_at: "2026-09-26T10:43:00.156106+05:30",
  ...overrides,
});

const page = (results, meta = {}) => ({
  success: true,
  data: { count: results.length, total_pages: 1, current_page: 1, results, ...meta },
});

beforeEach(() => {
  handler = vi.fn();
  api.defaults.adapter = (config) => Promise.resolve(handler(config));
});

describe("getInvoices", () => {
  it("asks for paid purchases only", async () => {
    handler.mockImplementation((c) => respond(c, page([])));
    await getInvoices({ page: 2 });

    const config = handler.mock.calls[0][0];
    expect(config.url).toBe("/payment/v1/credit_purchase_history/");
    expect(config.params).toEqual({ page: 2, is_paid: true });
  });

  it("keeps only what the page shows", async () => {
    handler.mockImplementation((c) => respond(c, page([row()])));
    const { invoices } = await getInvoices();

    expect(invoices).toEqual([
      {
        id: "7e119159",
        invoiceNumber: "LETSHYRE-00011",
        paidAt: "2026-09-26T10:43:32.784837+05:30",
        planName: "Pro",
        credits: 2,
        subtotal: 2,
        discount: 0.2,
        couponCode: "P0TENOFF2",
        gst: 0.36,
        total: 2.16,
        paymentRef: "pay_TgXu8P8uEzgLFQ",
        invoiceUrl: null,
      },
    ]);
    expect(JSON.stringify(invoices)).not.toMatch(/signature|rzp_test|order_Tg|EMP-/);
  });

  it("treats a purchase without a plan as a top-up", async () => {
    handler.mockImplementation((c) =>
      respond(c, page([row({ credit_plan: null, coupon: null, promo_code: null, discount_amount: "0.00" })])),
    );
    const [invoice] = (await getInvoices()).invoices;
    expect(invoice).toMatchObject({ planName: null, couponCode: null, discount: 0 });
  });

  it("drops unpaid and malformed rows even if the server sends them", async () => {
    handler.mockImplementation((c) =>
      respond(
        c,
        page([row(), row({ id: "pending", is_paid: false }), row({ id: "broken", total_with_gst: "n/a" })]),
      ),
    );
    const { invoices } = await getInvoices();
    expect(invoices.map((invoice) => invoice.id)).toEqual(["7e119159"]);
  });

  it("links a PDF only over http(s)", async () => {
    handler.mockImplementation((c) =>
      respond(
        c,
        page([
          row({ id: "a", invoice_file: "https://cdn.letshyre.ai/invoices/LETSHYRE-00011.pdf" }),
          row({ id: "b", invoice_file: "javascript:alert(1)" }),
        ]),
      ),
    );
    const { invoices } = await getInvoices();
    expect(invoices[0].invoiceUrl).toBe("https://cdn.letshyre.ai/invoices/LETSHYRE-00011.pdf");
    expect(invoices[1].invoiceUrl).toBeNull();
  });

  it("passes pagination through", async () => {
    handler.mockImplementation((c) => respond(c, page([row()], { total_pages: 3, current_page: 2 })));
    await expect(getInvoices({ page: 2 })).resolves.toMatchObject({ totalPages: 3, currentPage: 2 });
  });

  it("rejects a response it can't read", async () => {
    handler.mockImplementation((c) => respond(c, { success: false }));
    await expect(getInvoices()).rejects.toBeInstanceOf(InvalidInvoicesError);
  });
});
