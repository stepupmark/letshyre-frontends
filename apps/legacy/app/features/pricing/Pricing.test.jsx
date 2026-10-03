import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { MemoryRouter, Route, RouterProvider, Routes, createMemoryRouter } from "react-router";
import { I18nextProvider } from "react-i18next";
import { getI18n } from "@/i18n/i18n";
import en from "@/i18n/messages/en/pricing.json";
import enCommon from "@/i18n/messages/en/common.json";
import { Pricing } from "@/features/pricing/Pricing";
import { PricingSkeleton, FAQ_PLACEHOLDERS, CUSTOM_FEATURES } from "@/features/pricing/components/PricingSkeleton";
import { PricingError } from "@/features/pricing/components/PricingError";
import { COMPARISON_ROWS, PLANS, TOP_UPS } from "@/features/pricing/lib/plans";
import { clientLoader } from "@/routes/_publicLang.$lang.pricing";
import { InvalidPriceError } from "@/features/pricing/services/pricing.service";
import { queryWrapper } from "@/test/helpers";

const getCreditPrice = vi.fn();
const getPublicPlans = vi.fn();
vi.mock("@/features/pricing/services/pricing.service", async (importOriginal) => ({
  ...(await importOriginal()),
  getCreditPrice: (...args) => getCreditPrice(...args),
  getPublicPlans: (...args) => getPublicPlans(...args),
}));

const livePlan = (slug, credits, basePrice, sortOrder, extra = {}) => ({
  id: `${slug}-id`,
  slug,
  name: slug,
  credits,
  basePrice,
  rate: basePrice ? 10 : null,
  planType: basePrice ? "paid_one_time" : "free",
  tagline: null,
  highlight: false,
  sortOrder,
  ...extra,
});
const LIVE_PLANS = [
  livePlan("free", 0, 0, 0),
  livePlan("pro", 50, 500, 10),
  livePlan("business", 100, 1000, 20, { highlight: true }),
];

const i18n = getI18n("en");
const httpError = (status) => Object.assign(new Error(String(status)), { response: { status } });

beforeEach(() => {
  getCreditPrice.mockResolvedValue({ costPerCredit: 2 });
  getPublicPlans.mockResolvedValue(LIVE_PLANS);
});

afterEach(() => {
  getCreditPrice.mockReset();
  getPublicPlans.mockReset();
  onlineManager.setOnline(true);
});

beforeAll(() => {
  i18n.addResourceBundle("en", "pricing", en, true, true);
  i18n.addResourceBundle("en", "common", enCommon, true, true);
});

const renderAt = (element) => {
  const { client } = queryWrapper();
  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/en/pricing"]}>
          <Routes>
            <Route path="/:lang/pricing" element={element} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

describe("Pricing", () => {
  it("renders exactly one h1", () => {
    renderAt(<Pricing />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders a card per plan with the right destination", () => {
    renderAt(<Pricing />);
    for (const plan of PLANS) {
      expect(screen.getByRole("heading", { level: 3, name: en.plans[plan.id].name })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: en.plans.free.cta })).toHaveAttribute("href", "/get-started");
    expect(screen.getByRole("link", { name: en.plans.pro.cta })).toHaveAttribute("href", "/en/pricing?checkout=pro");
    expect(screen.getByRole("link", { name: /^Buy 10 credits/ })).toHaveAttribute(
      "href",
      "/en/pricing?checkout=10-credits",
    );
    for (const link of screen.getAllByRole("link", { name: en.plans.custom.cta })) {
      expect(link).toHaveAttribute("href", "/en/contact");
    }
  });

  it("prices plans from the public plans and top-ups from the per-credit rate", async () => {
    renderAt(<Pricing />);
    expect(await screen.findByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("₹1,000")).toBeInTheDocument();
    expect(screen.getByText("Every credit costs ₹10, whichever plan you choose.")).toBeInTheDocument();
    expect(await screen.findByText("₹20")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy 10 credits for ₹20" })).toBeInTheDocument();
  });

  it("shows plan credits from the API", async () => {
    getPublicPlans.mockResolvedValue([livePlan("pro", 60, 600, 10)]);
    renderAt(<Pricing />);
    expect(await screen.findByText("₹600")).toBeInTheDocument();
    expect(screen.getAllByText("60 credits").length).toBeGreaterThan(0);
  });

  it("shows free and custom plans without waiting for a price", () => {
    getPublicPlans.mockReturnValue(new Promise(() => {}));
    renderAt(<Pricing />);
    expect(screen.getByText("₹0")).toBeInTheDocument();
    expect(screen.getByText(en.plans.custom.price)).toBeInTheDocument();
  });

  it("labels the comparison table for screen readers", () => {
    renderAt(<Pricing />);
    const table = screen.getByRole("table", { name: en.compare.caption });
    const rowHeaders = within(table).getAllByRole("rowheader");
    expect(rowHeaders).toHaveLength(COMPARISON_ROWS.length);
    expect(within(table).getAllByText(en.compare.values.included).length).toBeGreaterThan(0);
  });

  it("keeps collapsed FAQ answers in the markup", () => {
    const { container } = renderAt(<Pricing />);
    expect(container.textContent).toContain(en.faq.items[1].a);
    expect(screen.getByRole("link", { name: "refund policy", hidden: true })).toHaveAttribute("href", "/en/refund-policy");
  });
});

describe("live prices", () => {
  it("marks the plans busy while the price loads", () => {
    getPublicPlans.mockReturnValue(new Promise(() => {}));
    renderAt(<Pricing />);
    expect(screen.getByText(en.prices.loading)).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("shows top-up prices with GST noted, with no sign-in prompt", async () => {
    renderAt(<Pricing />);
    expect(await screen.findByText("₹20")).toBeInTheDocument();
    expect(screen.getAllByText(en.topUps.priceNote)).toHaveLength(TOP_UPS.length);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("offers a retry when top-up prices fail, keeping plan prices", async () => {
    getCreditPrice.mockRejectedValue(httpError(401));
    renderAt(<Pricing />);
    expect(await screen.findByText(en.prices.error.title)).toBeInTheDocument();
    expect(getCreditPrice).toHaveBeenCalledTimes(1);
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy 10 credits" })).toBeInTheDocument();
  });

  it("recovers when a retry succeeds", async () => {
    getPublicPlans.mockRejectedValueOnce(new InvalidPriceError("bad"));
    renderAt(<Pricing />);
    expect(await screen.findByText(en.prices.error.title)).toBeInTheDocument();
    expect(screen.getAllByText(en.plans.unavailable).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: en.prices.retry }));
    expect(await screen.findByText("₹500")).toBeInTheDocument();
    expect(screen.queryByText(en.prices.error.title)).not.toBeInTheDocument();
  });

  it("waits for the connection when offline", async () => {
    onlineManager.setOnline(false);
    renderAt(<Pricing />);
    expect((await screen.findAllByText(en.prices.offline.title)).length).toBe(2);
    expect(getPublicPlans).not.toHaveBeenCalled();
    expect(getCreditPrice).not.toHaveBeenCalled();
  });
});

describe("PricingSkeleton", () => {
  it("mirrors the page's cards, rows and packs", () => {
    renderAt(<PricingSkeleton />);
    expect(screen.getAllByTestId("plan-skeleton")).toHaveLength(PLANS.length);
    expect(screen.getAllByTestId("compare-skeleton")).toHaveLength(COMPARISON_ROWS.length);
    expect(screen.getAllByTestId("top-up-skeleton")).toHaveLength(TOP_UPS.length);
    expect(FAQ_PLACEHOLDERS).toBe(en.faq.items.length);
    expect(CUSTOM_FEATURES).toBe(en.plans.custom.features.length);
  });

  it("is announced as busy", () => {
    renderAt(<PricingSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(enCommon.pageState.loading)).toBeInTheDocument();
  });
});

describe("PricingError", () => {
  const renderError = (error) => {
    const router = createMemoryRouter(
      [
        {
          path: "/:lang/pricing",
          loader: () => {
            throw error;
          },
          element: null,
          ErrorBoundary: PricingError,
        },
      ],
      { initialEntries: ["/en/pricing"] },
    );
    return render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>,
    );
  };

  it("asks for a reload when a chunk from an old deploy is gone", async () => {
    renderError(new TypeError("Failed to fetch dynamically imported module: /assets/pricing.js"));
    expect(await screen.findByRole("heading", { level: 1, name: enCommon.pageState.update.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enCommon.pageState.reload })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: enCommon.pageState.home })).toHaveAttribute("href", "/en");
  });

  it("offers support on an unexpected failure", async () => {
    renderError(new Error("boom"));
    expect(await screen.findByRole("heading", { level: 1, name: enCommon.pageState.generic.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: enCommon.pageState.contact })).toHaveAttribute("href", "/en/contact");
  });
});

describe("pricing route", () => {
  it("sends other locales to the English page", async () => {
    const response = await clientLoader({ params: { lang: "hi" } }).catch((thrown) => thrown);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/en/pricing");
  });

  it("serves English as-is", async () => {
    await expect(clientLoader({ params: { lang: "en" } })).resolves.toBeNull();
  });
});
