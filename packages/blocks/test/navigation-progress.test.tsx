import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"

import { NavigationProgress } from "../src/navigation-progress.tsx"
import { expectAccessible } from "./axe.ts"

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

function setup(delayMs?: number) {
  let finish = (): void => undefined
  const router = createMemoryRouter([
    {
      path: "/",
      element: <NavigationProgress label="Loading page" delayMs={delayMs} />,
      children: [
        { index: true, element: null },
        {
          path: "slow",
          loader: () =>
            new Promise<null>((resolve) => {
              finish = () => {
                resolve(null)
              }
            }),
          element: null,
        },
      ],
    },
  ])
  render(<RouterProvider router={router} />)
  return {
    router,
    finish: () => {
      finish()
    },
  }
}

describe("NavigationProgress", () => {
  it("shows only for navigations slower than the delay, then clears", async () => {
    const { router, finish } = setup(50)
    act(() => {
      void router.navigate("/slow")
    })

    await wait(20)
    expect(screen.getByRole("status")).toBeEmptyDOMElement()

    expect(await screen.findByText("Loading page")).toBeInTheDocument()
    await expectAccessible()

    await act(async () => {
      finish()
      await wait(10)
    })
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })
})
