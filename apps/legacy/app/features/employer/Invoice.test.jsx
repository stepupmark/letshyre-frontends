import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { I18nextProvider } from "react-i18next";
import { getI18n } from "@/i18n/i18n";
import { AppLocaleContext } from "@/i18n/appLocale";
import en from "@/i18n/messages/en/employer.json";
import enCommon from "@/i18n/messages/en/common.json";
import { queryWrapper } from "@/test/helpers";
import { Invoice } from "./Invoice";

const getInvoices = vi.fn();
vi.mock("@/features/employer/services/invoices.service", () => ({
  getInvoices: (...args) => getInvoices(...args),
}));

const i18n = getI18n("en");

const invoice = (overrides = {}) => ({
  id: "a",
  invoiceNumber: "LETSHYRE-00011",
  paidAt: "2026-09-26T10:43:32+05:30",
  planName: "Pro",
  credits: 2,
  subtotal: 2,
  discount: 0.2,
  couponCode: "P0TENOFF2",
  gst: 0.36,
  total: 2.16,
  paymentRef: "pay_TgXu8P8uEzgLFQ",
  invoiceUrl: null,
  ...overrides,
});

beforeAll(() => {
  i18n.addResourceBundle("en", "employer", en, true, true);
  i18n.addResourceBundle("en", "common", enCommon, true, true);
});

beforeEach(() => {
  getInvoices.mockReset();
});

const renderPage = () => {
  const { client } = queryWrapper();
  render(
    <QueryClientProvider client={client}>
      <AppLocaleContext.Provider value={{ locale: "en" }}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Invoice />
          </MemoryRouter>
        </I18nextProvider>
      </AppLocaleContext.Provider>
    </QueryClientProvider>,
  );
};

describe("Invoice", () => {
  it("lists paid purchases with what was bought and what was paid", async () => {
    getInvoices.mockResolvedValue({
      invoices: [invoice(), invoice({ id: "b", planName: null, credits: 25, total: 29.5, invoiceNumber: "LETSHYRE-00016" })],
      totalPages: 1,
      currentPage: 1,
    });
    renderPage();

    expect(await screen.findByRole("button", { name: "Pro plan · 2 credits" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: en.invoice.caption });
    expect(within(table).getByRole("button", { name: "Top-up · 25 credits" })).toBeInTheDocument();
    expect(within(table).getByText("₹2.16")).toBeInTheDocument();
    expect(within(table).getByText("₹29.50")).toBeInTheDocument();
    expect(within(table).getByText("LETSHYRE-00016")).toBeInTheDocument();
    expect(getInvoices).toHaveBeenCalledWith({ page: 1 });
  });

  it("links to the pricing page to buy more", async () => {
    getInvoices.mockResolvedValue({ invoices: [invoice()], totalPages: 1, currentPage: 1 });
    renderPage();
    expect(await screen.findByRole("link", { name: en.invoice.buyCredits })).toHaveAttribute("href", "/en/pricing");
  });

  it("opens a receipt with the breakdown and payment reference", async () => {
    getInvoices.mockResolvedValue({ invoices: [invoice()], totalPages: 1, currentPage: 1 });
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "Pro plan · 2 credits" }));

    const receipt = await screen.findByRole("dialog");
    expect(within(receipt).getByRole("heading", { name: "Pro plan · 2 credits" })).toBeInTheDocument();
    expect(within(receipt).getByRole("rowheader", { name: "Coupon P0TENOFF2" })).toBeInTheDocument();
    expect(within(receipt).getByText("-₹0.20")).toBeInTheDocument();
    expect(within(receipt).getByText("₹0.36")).toBeInTheDocument();
    expect(within(receipt).getByText("pay_TgXu8P8uEzgLFQ")).toBeInTheDocument();
    expect(within(receipt).queryByRole("link", { name: /PDF/ })).not.toBeInTheDocument();
  });

  it("offers the PDF once the invoice has one", async () => {
    const url = "https://cdn.letshyre.ai/invoices/LETSHYRE-00011.pdf";
    getInvoices.mockResolvedValue({ invoices: [invoice({ invoiceUrl: url })], totalPages: 1, currentPage: 1 });
    renderPage();

    expect(await screen.findByRole("link", { name: "Download invoice LETSHYRE-00011" })).toHaveAttribute("href", url);
    await userEvent.click(screen.getByRole("button", { name: "Pro plan · 2 credits" }));
    expect(await screen.findByRole("link", { name: en.invoice.receipt.download })).toHaveAttribute("href", url);
  });

  it("says when an invoice number is still being prepared", async () => {
    getInvoices.mockResolvedValue({ invoices: [invoice({ invoiceNumber: null })], totalPages: 1, currentPage: 1 });
    renderPage();
    expect(await screen.findByText(en.invoice.preparing)).toBeInTheDocument();
  });

  it("shows an empty state before the first purchase", async () => {
    getInvoices.mockResolvedValue({ invoices: [], totalPages: 1, currentPage: 1 });
    renderPage();
    expect(await screen.findByText(en.invoice.empty.title)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("pages through the history", async () => {
    getInvoices.mockImplementation(({ page }) =>
      Promise.resolve({ invoices: [invoice({ id: `p${page}` })], totalPages: 2, currentPage: page }),
    );
    renderPage();
    await screen.findByRole("button", { name: "Pro plan · 2 credits" });
    await userEvent.click(screen.getByRole("button", { name: enCommon.pagination.page.replace("{{page}}", "2") }));
    expect(getInvoices).toHaveBeenLastCalledWith({ page: 2 });
  });
});
