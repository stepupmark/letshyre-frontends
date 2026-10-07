import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LOCALES, type Locale } from "@workspace/i18n"
import { describe, expect, it, vi } from "vitest"

import { LanguageSwitcher } from "../src/language-switcher.tsx"
import { expectAccessible } from "./axe.ts"

function setup(
  locales: readonly Locale[] = ["en", "hi", "ar"],
  current: Locale = "en"
) {
  const onSelect = vi.fn()
  render(
    <LanguageSwitcher
      current={current}
      locales={locales}
      label="Change language"
      searchLabel="Search languages"
      emptyLabel="No language found"
      hrefFor={(l) => `/${l}/pricing`}
      onSelect={onSelect}
    />
  )
  return { onSelect, user: userEvent.setup() }
}

describe("LanguageSwitcher", () => {
  it("names the trigger with the current language and its English name", () => {
    setup(["en", "hi"], "hi")
    expect(
      screen.getByRole("button", { name: "Change language: हिन्दी (Hindi)" })
    ).toBeInTheDocument()
  })

  it("lists links with hreflang, native and English names, current first", async () => {
    const { user } = setup(["hi", "en", "ar"], "ar")
    await user.click(screen.getByRole("button", { name: /Change language/ }))

    const links = await screen.findAllByRole("link")
    expect(links.map((l) => l.getAttribute("hreflang"))).toEqual([
      "ar",
      "hi",
      "en",
    ])
    const current = screen.getByRole("link", { current: true })
    expect(current).toBe(links[0])
    expect(links[1]).toHaveAttribute("href", "/hi/pricing")
    expect(links[1]).toHaveTextContent("हिन्दीHindi")
    expect(within(current).getByText("العربية")).toHaveAttribute("lang", "ar")
    await expectAccessible()
  })

  it("finds a language by its English name", async () => {
    const { user } = setup(LOCALES)
    await user.click(screen.getByRole("button", { name: /Change language/ }))

    const search = screen.getByRole("searchbox", { name: "Search languages" })
    expect(search).toHaveFocus()
    await user.type(search, "germ")
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual([
      "DeutschGerman",
    ])
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("link")).toHaveFocus()

    await user.clear(search)
    await user.type(search, "klingon")
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("No language found")
  })

  it("reports the choice before navigating", async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByRole("button", { name: /Change language/ }))
    const hindi = await screen.findByRole("link", { name: /Hindi/ })
    hindi.addEventListener("click", (e) => {
      e.preventDefault()
    })
    await user.click(hindi)
    expect(onSelect).toHaveBeenCalledWith("hi")
  })
})
