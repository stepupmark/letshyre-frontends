import outfitLatin from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url"
import { lazy, Suspense, type ReactNode } from "react"
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ApiError } from "@workspace/api"
import { ErrorScreen } from "@workspace/blocks/error-screen"
import { ThemeProvider } from "@workspace/blocks/theme-provider"
import { NuqsAdapter } from "nuqs/adapters/react-router/v8"
import { LoaderCircle } from "lucide-react"
import type { Route } from "./+types/root"
import { Button } from "@workspace/ui/components/button"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { getErrorMessage } from "@/lib/errors"
import { queryClient } from "@/lib/query/query-client"
import "./app.css"

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : () => null

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    href: outfitLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "apple-touch-icon", href: "/icon.png" },
]

export const meta: Route.MetaFunction = () => [
  { name: "robots", content: "noindex, nofollow" },
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider switchable>
          <TooltipProvider>
            <Outlet />
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </NuqsAdapter>
      <Suspense>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </Suspense>
    </QueryClientProvider>
  )
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong"
  let description = "An unexpected error occurred. Please try again."
  let details: string | undefined

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Page not found" : title
    description =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || description
  } else if (error instanceof ApiError) {
    description = getErrorMessage(error)
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.stack ?? error.message
  }

  return (
    <main id="main">
      <ErrorScreen
        code={isRouteErrorResponse(error) ? error.status : undefined}
        title={title}
        description={description}
        details={details}
      >
        <Button
          variant="outline"
          onClick={() => {
            window.location.reload()
          }}
        >
          Try again
        </Button>
        <Button nativeButton={false} render={<Link to="/dashboard" />}>
          Back to dashboard
        </Button>
      </ErrorScreen>
    </main>
  )
}
