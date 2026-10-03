import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { I18nextProvider } from "react-i18next";
import { getI18n } from "@/i18n/i18n";
import en from "@/i18n/messages/en/pricing.json";
import api from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";
import { trackEvent } from "@/lib/metaPixel";
import { queryWrapper } from "@/test/helpers";
import { CheckoutDialog } from "./CheckoutDialog";

vi.mock("@/lib/metaPixel", () => ({ trackEvent: vi.fn() }));

const i18n = getI18n("en");

const PLANS = [
  {
    id: "business-id",
    slug: "business",
    name: "Business",
    credits_included: 100,
    base_price: "1000.00",
    per_credit_effective_rate: "10.00",
    plan_type: "paid_one_time",
    highlight: true,
    sort_order: 20,
  },
];

// A stand-in backend: 10 per credit, SAVE10 takes 10% off, GST on the
// discounted amount.
const priceOf = (tokens, couponCode) => {
  const base = tokens * 10;
  const discount = couponCode === "SAVE10" ? base / 10 : 0;
  const gst = (base - discount) * 0.18;
  return { base, discount, gst, total: base - discount + gst };
};

const quoteBody = ({ tokens, coupon_code: couponCode }) => {
  const { base, discount, gst, total } = priceOf(tokens, couponCode);
  const applied = couponCode === "SAVE10";
  return {
    success: true,
    data: {
      breakdown: {
        tokens,
        rate_per_credit: "10.00",
        base_amount: base.toFixed(2),
        discount_amount: discount.toFixed(2),
        gst_percent: "18",
        gst_amount: gst.toFixed(2),
        total_with_gst: total.toFixed(2),
      },
      coupon: couponCode
        ? {
            code: couponCode,
            applied,
            discount_type: "percentage",
            discount_value: "10.00",
            error_message: applied ? null : "This coupon has expired.",
          }
        : null,
    },
  };
};

const ok = (config, data) => ({ status: 200, data, config, headers: {} });
const fail = (config, status) =>
  Promise.reject(
    Object.assign(new Error(String(status)), { config, response: { status, data: {}, config, headers: {} } }),
  );

let requests;
let server;
let razorpays;

class FakeRazorpay {
  constructor(options) {
    this.options = options;
    razorpays.push(this);
  }

  on(event, callback) {
    this[event] = callback;
  }

  open() {
    this.opened = true;
  }
}

const sent = (fragment) => requests.filter((config) => config.url.includes(fragment));
const body = (config) => JSON.parse(config.data);

beforeAll(() => {
  i18n.addResourceBundle("en", "pricing", en, true, true);
});

beforeEach(() => {
  localStorage.clear();
  requests = [];
  razorpays = [];
  window.Razorpay = FakeRazorpay;
  server = {
    quote: (config) => ok(config, quoteBody(config.params)),
    order: (config) => {
      const { tokens, coupon_code: couponCode } = body(config);
      return ok(config, {
        success: true,
        data: {
          razorpay_key: "rzp_test_key",
          order_id: "order_1",
          amount: priceOf(tokens, couponCode).total,
          currency: "INR",
          purchase_id: "purchase_1",
        },
      });
    },
    verify: (config) => ok(config, { success: true }),
  };
  api.defaults.adapter = async (config) => {
    requests.push(config);
    if (config.url.includes("credit_plans")) return ok(config, { success: true, data: { results: PLANS } });
    if (config.url.includes("calculate-token-cost")) return server.quote(config);
    if (config.url.includes("create_razorpay_order")) return server.order(config);
    if (config.url.includes("verify_razorpay_order")) return server.verify(config);
    throw new Error(`Unexpected request ${config.url}`);
  };
});

afterEach(() => {
  delete window.Razorpay;
  vi.mocked(trackEvent).mockClear();
});

const signIn = (user) => {
  localStorage.setItem("accessToken", "token");
  localStorage.setItem("user", JSON.stringify(user));
};
const signInEmployer = () =>
  signIn({ role: "Employer", is_profile_completed: true, email: "hr@acme.test", name: 42 });

function Location() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

const renderCheckout = (search = "?checkout=business") => {
  const { client } = queryWrapper();
  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/en/pricing${search}`]}>
          <Routes>
            <Route
              path="/:lang/pricing"
              element={
                <>
                  <CheckoutDialog />
                  <Location />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
  return client;
};

const payButton = (amount) => screen.findByRole("button", { name: `Pay ${amount}` });

describe("who can buy", () => {
  it("asks a guest to sign in, and comes back to this checkout", async () => {
    renderCheckout();
    expect(await screen.findByRole("heading", { name: "Business plan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.checkout.gate.guest.signIn })).toHaveAttribute(
      "href",
      "/employer/sign-in",
    );
    expect(screen.getByRole("link", { name: en.checkout.gate.guest.register })).toHaveAttribute(
      "href",
      "/employer/register",
    );
    expect(sent("calculate-token-cost")).toHaveLength(0);
  });

  it("tells a candidate that credits are for employers", async () => {
    signIn({ role: "Employee" });
    renderCheckout();
    expect(await screen.findByRole("heading", { name: en.checkout.gate.candidate.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.checkout.gate.candidate.action })).toHaveAttribute("href", "/employee");
    expect(sent("calculate-token-cost")).toHaveLength(0);
  });

  it("sends an employer with an unfinished profile to onboarding", async () => {
    signIn({ role: "Employer", is_profile_completed: false });
    renderCheckout();
    expect(await screen.findByRole("link", { name: en.checkout.gate.onboarding.action })).toHaveAttribute(
      "href",
      "/employer/onboarding",
    );
  });

  it("falls back to sign-in when the session has expired", async () => {
    signInEmployer();
    server.quote = (config) => fail(config, 401);
    renderCheckout();
    expect(await screen.findByRole("link", { name: en.checkout.gate.guest.signIn })).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("order review", () => {
  beforeEach(signInEmployer);

  it("shows the server's breakdown for the plan", async () => {
    renderCheckout();
    expect(await payButton("₹1,180.00")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "100 credits × ₹10.00" })).toBeInTheDocument();
    expect(screen.getByText("₹1,000.00")).toBeInTheDocument();
    expect(screen.getByText("₹180.00")).toBeInTheDocument();

    expect(api.getUri(sent("calculate-token-cost")[0])).toMatch(/\?tokens=100&plan_id=business-id$/);
  });

  it("prices a top-up by credits alone", async () => {
    renderCheckout("?checkout=25-credits");
    expect(await screen.findByRole("heading", { name: "25 credits" })).toBeInTheDocument();
    await userEvent.click(await payButton("₹295.00"));

    expect(api.getUri(sent("calculate-token-cost")[0])).toMatch(/\?tokens=25$/);
    expect(body(sent("create_razorpay_order")[0])).toEqual({ tokens: 25 });
  });

  it("says so when the plan can't be sold", async () => {
    renderCheckout("?checkout=enterprise");
    expect(await screen.findByRole("heading", { name: en.checkout.unavailable.title })).toBeInTheDocument();
  });

  it("closes back to the page", async () => {
    renderCheckout();
    await payButton("₹1,180.00");
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(/^\/en\/pricing$/));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("coupons", () => {
  beforeEach(signInEmployer);

  const applyCoupon = async (code) => {
    await userEvent.click(await screen.findByRole("button", { name: en.checkout.coupon.toggle }));
    await userEvent.type(screen.getByLabelText(en.checkout.coupon.label), code);
    await userEvent.click(screen.getByRole("button", { name: en.checkout.coupon.apply }));
  };

  it("applies a valid code and charges the discounted total", async () => {
    renderCheckout();
    await applyCoupon("save10");

    expect(await payButton("₹1,062.00")).toBeInTheDocument();
    expect(screen.getByText("10% off applied")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Coupon SAVE10" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Pay ₹1,062.00" }));
    expect(body(sent("create_razorpay_order")[0])).toEqual({
      tokens: 100,
      plan_id: "business-id",
      coupon_code: "SAVE10",
    });
  });

  it("shows why a code was rejected and keeps the full price", async () => {
    renderCheckout();
    await applyCoupon("OLD1");

    expect(await screen.findByText("This coupon has expired.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,180.00" })).toBeInTheDocument();
  });

  it("checks the code's shape before asking the server", async () => {
    renderCheckout();
    await applyCoupon("no spaces");

    expect(await screen.findByText(en.checkout.coupon.invalid)).toBeInTheDocument();
    expect(sent("calculate-token-cost")).toHaveLength(1);
  });

  it("can be removed again", async () => {
    renderCheckout();
    await applyCoupon("SAVE10");
    await userEvent.click(await screen.findByRole("button", { name: "Remove coupon SAVE10" }));
    expect(await payButton("₹1,180.00")).toBeInTheDocument();
  });
});

describe("paying", () => {
  beforeEach(signInEmployer);

  const pay = async () => {
    await userEvent.click(await payButton("₹1,180.00"));
    await waitFor(() => expect(razorpays.at(-1)?.opened).toBe(true));
    return razorpays.at(-1);
  };

  it("opens Razorpay on the server's order and hides the dialog behind it", async () => {
    renderCheckout();
    const razorpay = await pay();

    expect(body(sent("create_razorpay_order")[0])).toEqual({ tokens: 100, plan_id: "business-id" });
    expect(razorpay.options).toMatchObject({
      key: "rzp_test_key",
      order_id: "order_1",
      currency: "INR",
      prefill: { email: "hr@acme.test" },
      notes: { purchase_id: "purchase_1" },
    });
    expect(razorpay.options).not.toHaveProperty("amount");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("verifies the payment and refreshes the employer's credits", async () => {
    const client = renderCheckout();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const razorpay = await pay();

    act(() =>
      razorpay.options.handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "order_1",
        razorpay_signature: "sig",
      }),
    );

    expect(await screen.findByRole("heading", { name: "100 credits added" })).toBeInTheDocument();
    expect(screen.getByText("pay_1")).toBeInTheDocument();
    expect(body(sent("verify_razorpay_order")[0])).toEqual({
      razorpay_payment_id: "pay_1",
      razorpay_order_id: "order_1",
      razorpay_signature: "sig",
      purchase_id: "purchase_1",
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.employer.credits() });
    expect(trackEvent).toHaveBeenCalledWith("Purchase", { value: 1180, currency: "INR" }, "pay_1");
  });

  it("keeps the payment reference when verification fails, and can try again", async () => {
    server.verify = (config) => ok(config, { success: false });
    renderCheckout();
    const razorpay = await pay();
    act(() =>
      razorpay.options.handler({ razorpay_payment_id: "pay_1", razorpay_order_id: "order_1", razorpay_signature: "sig" }),
    );

    expect(await screen.findByRole("heading", { name: en.checkout.unconfirmed.title })).toBeInTheDocument();
    expect(screen.getByText("pay_1")).toBeInTheDocument();

    server.verify = (config) => ok(config, { success: true });
    await userEvent.click(screen.getByRole("button", { name: en.checkout.unconfirmed.retry }));
    expect(await screen.findByRole("heading", { name: "100 credits added" })).toBeInTheDocument();
  });

  it("returns to the review when Razorpay is closed, and reuses the order", async () => {
    renderCheckout();
    const first = await pay();
    act(() => first.options.modal.ondismiss());

    expect(await screen.findByText(en.checkout.notice.cancelled.title)).toBeInTheDocument();

    await pay();
    expect(sent("create_razorpay_order")).toHaveLength(1);
    expect(razorpays).toHaveLength(2);
  });

  it("explains a failed attempt once Razorpay is closed", async () => {
    renderCheckout();
    const razorpay = await pay();
    act(() => {
      razorpay["payment.failed"]({ error: { description: "Your card was declined." } });
      razorpay.options.modal.ondismiss();
    });

    expect(await screen.findByText(en.checkout.notice.failed.title)).toBeInTheDocument();
    expect(screen.getByText("Your card was declined.")).toBeInTheDocument();
  });

  it("stops when the order's total doesn't match the one shown", async () => {
    server.order = (config) =>
      ok(config, {
        success: true,
        data: { razorpay_key: "k", order_id: "order_2", amount: 1200, currency: "INR", purchase_id: "p" },
      });
    renderCheckout();
    await userEvent.click(await payButton("₹1,180.00"));

    expect(await screen.findByText(en.checkout.notice.priceChanged.title)).toBeInTheDocument();
    expect(razorpays).toHaveLength(0);
    await waitFor(() => expect(sent("calculate-token-cost").length).toBeGreaterThan(1));
  });

  it("creates one order however fast Pay is pressed", async () => {
    renderCheckout();
    const button = await payButton("₹1,180.00");
    await userEvent.dblClick(button);
    await waitFor(() => expect(razorpays).toHaveLength(1));
    expect(sent("create_razorpay_order")).toHaveLength(1);
  });

  it("reports a Razorpay script that won't load", async () => {
    delete window.Razorpay;
    const append = vi.spyOn(document.head, "append").mockImplementation((script) => script.onerror());
    renderCheckout();
    await userEvent.click(await payButton("₹1,180.00"));

    expect(await screen.findByText(en.checkout.notice.blocked.title)).toBeInTheDocument();
    append.mockRestore();
  });
});
