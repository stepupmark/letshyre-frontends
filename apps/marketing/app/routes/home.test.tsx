import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import Home from "./home"

it("renders the page heading", () => {
  render(<Home />)
  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
})
