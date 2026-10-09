import outfitLatin from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@workspace/blocks/theme-provider"
import { dirFor, toLocale } from "@workspace/i18n"
import { I18nProvider } from "@workspace/i18n/react"
import { Toaster } from "@workspace/ui/components/sonner"
import { useState } from "react"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useParams,
} from "react-router"

import type { Route } from "./+types/root"
import { RouteError } from "./components/route-error"
import { usePageViews } from "./hooks/use-page-views"
import { env } from "./lib/env"
import { createQueryClient } from "./lib/query-client"
import common from "./locales/en/common.json"
import "./styles/app.css"

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    href: outfitLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const lang = toLocale(useParams().lang)

  return (
    <html lang={lang} dir={dirFor(lang)} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {env.VITE_ENV !== "production" && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Meta />
        <Links />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const [queryClient] = useState(createQueryClient)
  usePageViews()

  return (
    <ThemeProvider switchable>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

// outside every layout, e.g. a URL no route matches; English is always available
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <I18nProvider lang="en" messages={{ en: { common } }}>
      <main id="main">
        <RouteError error={error} />
      </main>
    </I18nProvider>
  )
}
