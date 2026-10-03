import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useParams,
} from "react-router"

import type { Route } from "./+types/root"
import { env } from "./lib/env"
import "./styles/app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang = "en" } = useParams()

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {env.VITE_ENV !== "production" && (
          <meta name="robots" content="noindex, nofollow" />
        )}
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
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : 500

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-2 px-4">
      <p className="text-sm text-muted-foreground">{status}</p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="overflow-x-auto text-xs">{error.stack}</pre>
      )}
    </main>
  )
}
