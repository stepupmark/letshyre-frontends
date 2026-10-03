import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { I18nProvider } from "@workspace/i18n/react"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { createMemoryRouter, RouterProvider } from "react-router"

import common from "../app/locales/en/common.json"
import home from "../app/locales/en/home.json"
import pricing from "../app/locales/en/pricing.json"
import seo from "../app/locales/en/seo.json"

/** Renders inside the router, English copy and a fresh query client. */
export function renderPage(ui: ReactNode, { path = "/en" } = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: "*", element: ui }], {
    initialEntries: [path],
  })
  return render(
    <QueryClientProvider client={client}>
      <I18nProvider lang="en" messages={{ en: { common, home, pricing, seo } }}>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>
  )
}
