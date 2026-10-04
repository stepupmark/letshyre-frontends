// Serves build/client the way production nginx will (docs/baseline/url-contract.md).
// usage: node e2e/serve.ts [port]

import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseNginxMap } from "../scripts/csp.ts"

const ROOT = resolve(fileURLToPath(new URL("../build/client", import.meta.url)))
const PORT = Number(process.argv[2] ?? 4173)
const CSP_MAP = resolve(ROOT, "../csp.map")
// enforced here (report-only in production) so e2e catches a policy that breaks the page
const csp = existsSync(CSP_MAP)
  ? parseNginxMap(readFileSync(CSP_MAP, "utf8"))
  : undefined

const LOCALES = "en|hi|fr|ja|ar|te|ta|es|nl|ru|kn|ml|ur|bn|de|pt|it|ko|id"
const LOCALE_PAGE = new RegExp(`^/(${LOCALES})(/[a-z-]+)?$`)

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".data": "text/x-script",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".mp4": "video/mp4",
}

const fileAt = (path: string) => {
  const file = normalize(join(ROOT, path))
  return file.startsWith(ROOT) && existsSync(file) && statSync(file).isFile()
    ? file
    : null
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost")
  const path = decodeURIComponent(url.pathname)

  const send = (status: number, file: string | null) => {
    if (!file) return res.writeHead(status).end()
    const type = TYPES[extname(file)] ?? "application/octet-stream"
    const policy =
      csp && type.startsWith("text/html")
        ? (csp.policies.get(path) ?? csp.fallback)
        : undefined
    res.writeHead(status, {
      "content-type": type,
      ...(policy && { "content-security-policy": policy }),
    })
    createReadStream(file).pipe(res)
  }
  const redirect = (status: number, to: string) =>
    res.writeHead(status, { location: to + url.search }).end()

  if (path === "/") return redirect(301, "/en")
  if (path.length > 1 && path.endsWith("/"))
    return redirect(301, path.slice(0, -1))

  const asset = fileAt(path)
  if (asset) return send(200, asset)

  const page = LOCALE_PAGE.exec(path)
  if (page) {
    const html = fileAt(`${path}/index.html`)
    if (html) return send(200, html)
    if (page[1] !== "en" && fileAt(`/en${page[2] ?? ""}/index.html`)) {
      return redirect(302, `/en${page[2] ?? ""}`)
    }
  }

  send(404, fileAt("/404/index.html"))
}).listen(PORT, () => {
  console.log(`serving ${ROOT} on http://localhost:${PORT}`)
})
