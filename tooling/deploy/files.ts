// How each built file is stored in S3: its type, cache header and whether it ships at all.
// docs/deployment.md §5 explains the choices.

export const APPS = ["marketing", "app", "admin"] as const
export type AppName = (typeof APPS)[number]

export const isAppName = (value: unknown): value is AppName =>
  APPS.includes(value as AppName)

const IMMUTABLE = "public, max-age=31536000, immutable"
// browsers revalidate every time; the edge keeps it until the deploy's invalidation
const REVALIDATE = "public, max-age=0, s-maxage=31536000, must-revalidate"
const DAILY = "public, max-age=86400, s-maxage=31536000"

const TYPES: Readonly<Record<string, string>> = {
  html: "text/html; charset=utf-8",
  data: "text/x-script",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  webmanifest: "application/manifest+json",
  xml: "application/xml; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  ico: "image/x-icon",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  woff2: "font/woff2",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

const extensionOf = (key: string) =>
  /\.([a-z0-9]+)$/i.exec(key)?.[1]?.toLowerCase()

/** The Content-Type for a key; an extension nobody listed fails the deploy rather than guessing. */
export function contentTypeOf(key: string): string {
  if (/(^|\/)feed\.xml$/.test(key)) return "application/rss+xml; charset=utf-8"
  const type = TYPES[extensionOf(key) ?? ""]
  if (!type) throw new Error(`${key}: no content type for this extension`)
  return type
}

export const isAsset = (key: string) => key.startsWith("assets/")

export function cacheControlOf(key: string): string {
  if (isAsset(key)) return IMMUTABLE
  return /\.(html|data|xml|txt|json|webmanifest)$/.test(key)
    ? REVALIDATE
    : DAILY
}

/** Files the build writes that must never be served. */
export function isSkipped(app: AppName, key: string): boolean {
  const name = key.slice(key.lastIndexOf("/") + 1)
  if (name.startsWith(".") || name.endsWith(".md")) return true
  // marketing's root index.html is the SPA fallback shell; `/` redirects to /en instead
  if (app === "marketing" && key === "index.html") return true
  // resource routes (the feed, the search index) also get a .data twin nobody requests
  return /\.(xml|json)\.data$/.test(key)
}

/** The csp.map route a key's policy is listed under, or null when it uses the fallback. */
export function cspRouteOf(app: AppName, key: string): string | null {
  if (app !== "marketing" || !key.endsWith("index.html")) return null
  const route = `/${key.slice(0, -"/index.html".length)}`
  return route === "/404" ? null : route
}

export const isHtml = (key: string) => key.endsWith(".html")

/**
 * Marketing's 404 page, served only as CloudFront's error page. No viewer-response function runs on
 * errors, so CSP metadata on it would reach the browser as raw `x-amz-meta-*` headers.
 */
export const isErrorPage = (app: AppName, key: string) =>
  app === "marketing" && key === "404/index.html"

// the routers keep it from ever being served (infra/cloudfront)
export const MANIFEST_KEY = "_deploy/manifest.json"
