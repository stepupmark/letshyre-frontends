import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { I18nextProvider } from "react-i18next";
import { getI18n } from "@/i18n/i18n";
import enCommon from "@/i18n/messages/en/common.json";
import { Navbar } from "@/components/layout/Navbar";

vi.mock("./LanguageSwitcher", () => ({
  LanguageSwitcher: ({ compact }) => <button data-testid="language" data-compact={String(!!compact)} />,
}));

const i18n = getI18n("en");
const LINK_WIDTH = 120;
const LINKS = 6;
const RIGHT_SIDE = 500;

let rowWidth = 0;
let notify = () => {};

beforeAll(() => {
  i18n.addResourceBundle("en", "common", enCommon, true, true);
});

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function () {
    if (this.tagName === "NAV") return this.classList.contains("hidden") ? 0 : rowWidth - RIGHT_SIDE;
    if (this.firstElementChild?.tagName === "DIV" && this.querySelector("nav")) return rowWidth;
    return 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    return { width: this.tagName === "A" && this.parentElement?.tagName === "NAV" ? LINK_WIDTH : 0 };
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderAt = (width) => {
  rowWidth = width;
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={["/en/pricing"]}>
        <Routes>
          <Route path="/:lang/pricing" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );
};

const resizeTo = (width) =>
  act(() => {
    rowWidth = width;
    notify();
  });

// Hidden by a class on the element or any of its ancestors, at any width.
const hiddenAncestor = (element) =>
  element.closest('[class~="hidden"], [class~="max-xl:hidden"]');

const primaryNav = () => screen.getByRole("navigation", { name: enCommon.nav.primaryAria, hidden: true });

describe("Navbar", () => {
  it("links to the English pricing page", () => {
    renderAt(2000);
    expect(screen.getByRole("link", { name: enCommon.nav.pricing })).toHaveAttribute("href", "/en/pricing");
  });

  it("keeps the links inline when they fit", () => {
    renderAt(RIGHT_SIDE + LINK_WIDTH * LINKS + 50);
    expect(primaryNav()).not.toHaveClass("hidden");
  });

  it("collapses into the menu when the links don't fit, and comes back once they do", () => {
    renderAt(RIGHT_SIDE + LINK_WIDTH * LINKS - 100);
    expect(primaryNav()).toHaveClass("hidden");

    resizeTo(RIGHT_SIDE + LINK_WIDTH * LINKS - 10);
    expect(primaryNav()).toHaveClass("hidden");

    resizeTo(RIGHT_SIDE + LINK_WIDTH * LINKS + 10);
    expect(primaryNav()).not.toHaveClass("hidden");

    resizeTo(RIGHT_SIDE + LINK_WIDTH * LINKS - 100);
    expect(primaryNav()).toHaveClass("hidden");
  });

  it("keeps one language switcher in the bar when the links fit", () => {
    renderAt(RIGHT_SIDE + LINK_WIDTH * LINKS + 50);
    const [switcher] = screen.getAllByTestId("language");
    expect(screen.getAllByTestId("language")).toHaveLength(1);
    expect(hiddenAncestor(switcher)).toBeNull();
    expect(switcher).toHaveAttribute("data-compact", "false");
  });

  it("keeps the language switcher beside the menu button once the links collapse", () => {
    renderAt(RIGHT_SIDE + LINK_WIDTH * LINKS - 100);
    const switcher = screen.getByTestId("language");
    const menuButton = screen.getByRole("button", { name: enCommon.nav.toggle });
    expect(hiddenAncestor(switcher)).toBeNull();
    expect(switcher).toHaveAttribute("data-compact", "true");
    expect(menuButton.parentElement).toBe(switcher.parentElement);
  });
});
