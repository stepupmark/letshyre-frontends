import outfitLatin from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@workspace/blocks/theme-provider"
import { dirFor } from "@workspace/i18n"
import { I18nProvider } from "@workspace/i18n/react"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useEffect, useState } from "react"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"

import type { Route } from "./+types/root"
import { MotionProvider } from "./components/motion/motion-provider"
import { RouteError } from "./components/route-error"
import { locale, namespaces } from "./lib/i18n"
import { createQueryClient } from "./lib/query-client"
import common from "./locales/en/common.json"
import "./styles/app.css"

// English common is bundled so the error screen works before anything loads
const messages = { en: { common } }

export const clientMiddleware = [namespaces(["common"])]

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    href: outfitLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
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

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dirFor(locale)
  }, [])

  return (
    <ThemeProvider>
      <I18nProvider lang={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          <MotionProvider>
            <TooltipProvider>
              <Outlet />
              <Toaster position="bottom-center" />
            </TooltipProvider>
          </MotionProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

// SPA mode renders this into index.html; the page is blank until JS runs
export function HydrateFallback() {
  return null
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <I18nProvider lang="en" messages={messages}>
      <main id="main">
        <RouteError error={error} />
      </main>
    </I18nProvider>
  )
}
