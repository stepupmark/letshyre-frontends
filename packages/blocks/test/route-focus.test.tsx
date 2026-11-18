import { act, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"

import { useRouteFocus } from "../src/route-focus.ts"

function Layout() {
  useRouteFocus()
  return (
    <main id="main">
      <Outlet />
    </main>
  )
}

function setup() {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <h1>Home</h1> },
        { path: "pricing", element: <h1>Pricing</h1> },
        {
          path: "form",
          element: (
            <>
              <h1>Form</h1>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the case under test */}
              <input aria-label="Email" autoFocus />
            </>
          ),
        },
      ],
    },
  ])
  render(<RouterProvider router={router} />)
  return router
}

const go = async (router: ReturnType<typeof setup>, to: string) => {
  await act(() => router.navigate(to))
}

describe("useRouteFocus", () => {
  it("leaves focus alone on the first render", async () => {
    setup()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(document.body).toHaveFocus()
  })

  it("moves focus to the new page's heading after navigating", async () => {
    const router = setup()
    await go(router, "/pricing")
    const heading = screen.getByRole("heading", { name: "Pricing" })
    await waitFor(() => {
      expect(heading).toHaveFocus()
    })
    expect(heading).toHaveAttribute("tabindex", "-1")
  })

  it("keeps focus a page placed on purpose", async () => {
    const router = setup()
    await go(router, "/form")
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus()
  })

  it("lets an anchor link scroll to its own target", async () => {
    const router = setup()
    await go(router, "/pricing#plans")
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(document.body).toHaveFocus()
  })
})
