import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { loadEnv } from "vite"

export const CLIENT_DIR = fileURLToPath(
  new URL("../build/client/", import.meta.url)
)

function scriptHashes(html) {
  const hashes = new Set()
  for (const [, body] of html.matchAll(
    /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g
  )) {
    const digest = createHash("sha256").update(body, "utf8").digest("base64")
    hashes.add(`'sha256-${digest}'`)
  }
  return [...hashes]
}

function contentSecurityPolicy(html) {
  const env = { ...loadEnv("production", process.cwd(), ""), ...process.env }
  const apiOrigin = new URL(env.VITE_API_BASE_URL).origin
  // where photos, logos and KYC documents are hosted; any https host until it's pinned
  const mediaOrigins = env.MEDIA_ORIGINS || "https:"

  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes(html).join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${mediaOrigins}`,
    `frame-src ${mediaOrigins}`,
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}

export function securityHeaders(html) {
  return {
    "Content-Security-Policy": contentSecurityPolicy(html),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",
  }
}

export const IMMUTABLE = "public, max-age=31536000, immutable"

function writeHostFiles() {
  const html = readFileSync(`${CLIENT_DIR}index.html`, "utf8")
  const headers = Object.entries(securityHeaders(html))
    .map(([name, value]) => `  ${name}: ${value}`)
    .join("\n")

  // Netlify / Cloudflare Pages format
  writeFileSync(
    `${CLIENT_DIR}_headers`,
    `/*\n${headers}\n\n/assets/*\n  Cache-Control: ${IMMUTABLE}\n\n/index.html\n  Cache-Control: no-cache\n`
  )
  writeFileSync(`${CLIENT_DIR}_redirects`, "/*  /index.html  200\n")
  console.log("Wrote _headers and _redirects to build/client")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeHostFiles()
