import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LanguageSwitcher } from "../src/language-switcher.tsx"
import { expectAccessible } from "./axe.ts"

function setup(dir?: "rtl") {
  const onSelect = vi.fn()
  render(
    <div dir={dir}>
      <LanguageSwitcher
        current="en"
        locales={["en", "hi", "ar"]}
        label="Language"
        hrefFor={(l) => `/${l}/pricing`}
        onSelect={onSelect}
      />
    </div>
  )
  return { onSelect, user: userEvent.setup() }
}

describe("LanguageSwitcher", () => {
  it("names the trigger with the visible language", async () => {
    setup()
    expect(
      screen.getByRole("button", { name: "Language: English" })
    ).toBeInTheDocument()
    await expectAccessible()
  })

  it("lists native names as links with lang, dir and the current one marked", async () => {
    const { user } = setup()
    await user.click(screen.getByRole("button", { name: /Language/ }))

    const items = await screen.findAllByRole("menuitem")
    expect(items.map((i) => i.textContent)).toEqual([
      "English",
      "हिन्दी",
      "العربية",
    ])

    const arabic = screen.getByRole("menuitem", { name: "العربية" })
    expect(arabic.tagName).toBe("A")
    expect(arabic).toHaveAttribute("href", "/ar/pricing")
    expect(arabic).toHaveAttribute("lang", "ar")
    expect(arabic).toHaveAttribute("dir", "rtl")
    expect(screen.getByRole("menuitem", { name: "English" })).toHaveAttribute(
      "aria-current",
      "true"
    )
    expect(
      screen.getByRole("menuitem", { name: "हिन्दी" })
    ).not.toHaveAttribute("aria-current")
    await expectAccessible()
  })

  it("reports the choice before navigating", async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByRole("button", { name: /Language/ }))
    const hindi = await screen.findByRole("menuitem", { name: "हिन्दी" })
    hindi.addEventListener("click", (e) => {
      e.preventDefault()
    })
    await user.click(hindi)
    expect(onSelect).toHaveBeenCalledWith("hi")
  })

  it("works inside an rtl page", async () => {
    const { user } = setup("rtl")
    await user.click(screen.getByRole("button", { name: /Language/ }))
    expect(await screen.findAllByRole("menuitem")).toHaveLength(3)
    await expectAccessible()
  })
})
