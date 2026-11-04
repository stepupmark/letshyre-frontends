import outfitLatin from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url"
import { QueryClientProvider } from "@tanstack/react-query"
import { LogoMark } from "@workspace/blocks/logo"
import { useRouteFocus } from "@workspace/blocks/route-focus"
import { ThemeProvider } from "@workspace/blocks/theme-provider"
import { dirFor } from "@workspace/i18n"
import { I18nProvider } from "@workspace/i18n/react"
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"

import type { Route } from "./+types/root"
import { MotionProvider } from "./components/motion/motion-provider"
import { RouteError } from "./components/route-error"
import { env } from "./lib/env"
import { locale, namespaces } from "./lib/i18n"
import { createQueryClient } from "./lib/query-client"
import common from "./locales/en/common.json"
import "./styles/app.css"

// sonner replays toasts made before it mounts, so it can load after first paint
const Toaster = lazy(() =>
  import("@workspace/ui/components/sonner").then((m) => ({
    default: m.Toaster,
  }))
)

// English common is bundled so the error screen works before anything loads
const messages = { en: { common } }

// Sonner's own mobile breakpoint; below it toasts go on top so they never cover a sticky composer
const narrow = "(max-width: 600px)"

function useNarrow() {
  return useSyncExternalStore(
    (change) => {
      const query = matchMedia(narrow)
      query.addEventListener("change", change)
      return () => {
        query.removeEventListener("change", change)
      }
    },
    () => matchMedia(narrow).matches
  )
}

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
  const isNarrow = useNarrow()
  useRouteFocus()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dirFor(locale)
  }, [])

  return (
    <ThemeProvider>
      <I18nProvider lang={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          <MotionProvider>
            <Outlet />
            <Suspense>
              <Toaster position={isNarrow ? "top-center" : "bottom-center"} />
            </Suspense>
          </MotionProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

// the card for shared app links; marketing serves the image on the same origin
const shareImage = new URL("/og/default.jpg", env.VITE_SITE_URL).href

// Prerendered into index.html, so it shows before any JS has loaded. Link previews never run JS,
// so these tags are all they see; each route's own <title> replaces them once this unmounts.
export function HydrateFallback() {
  return (
    <div aria-busy="true" className="grid min-h-svh place-items-center">
      <title>{common.appName}</title>
      <meta property="og:site_name" content={common.appName} />
      <meta property="og:title" content={common.appName} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={shareImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <LogoMark label="" className="size-10" />
    </div>
  )
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
