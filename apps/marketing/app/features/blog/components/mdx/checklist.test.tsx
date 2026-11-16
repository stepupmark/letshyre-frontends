import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, expect, it, vi } from "vitest"

import { Check, Checklist } from "./checklist"

vi.mock("@workspace/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, values?: { done: number; count: number }) =>
      values ? `${values.done} of ${values.count}` : key,
  }),
}))

const list = (items: string[]) => (
  <MemoryRouter initialEntries={["/en/blogs/offer"]}>
    <Checklist title="Before you sign">
      {items.map((item) => (
        <Check key={item}>{item}</Check>
      ))}
    </Checklist>
  </MemoryRouter>
)

beforeEach(() => {
  localStorage.clear()
})

it("keeps a tick on its item when an item is added above it", () => {
  const { unmount } = render(list(["Read the contract", "Check the notice"]))
  fireEvent.click(screen.getByLabelText("Check the notice"))
  unmount()

  render(list(["Ask about bonus", "Read the contract", "Check the notice"]))
  expect(screen.getByLabelText("Check the notice")).toBeChecked()
  expect(screen.getByLabelText("Read the contract")).not.toBeChecked()
  expect(screen.getByText("1 of 3")).toBeInTheDocument()
})

it("reads ticks saved as item positions before items had keys", () => {
  localStorage.setItem(
    "lh-blog:checklist:/en/blogs/offer:Before you sign",
    JSON.stringify([1])
  )
  render(list(["Read the contract", "Check the notice"]))
  expect(screen.getByLabelText("Check the notice")).toBeChecked()
})

it("doesn't count ticks for items that are gone", () => {
  const { unmount } = render(list(["Read the contract", "Check the notice"]))
  fireEvent.click(screen.getByLabelText("Read the contract"))
  fireEvent.click(screen.getByLabelText("Check the notice"))
  unmount()

  render(list(["Check the notice"]))
  expect(screen.getByText("1 of 1")).toBeInTheDocument()
})
