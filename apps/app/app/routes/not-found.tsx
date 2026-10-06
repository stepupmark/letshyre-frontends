import { data } from "react-router"

import { RouteError } from "@/components/route-error"

import type { Route } from "./+types/not-found"

export function clientLoader() {
  throw data(null, { status: 404 })
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError error={error} />
}

export default function NotFound() {
  return null
}
