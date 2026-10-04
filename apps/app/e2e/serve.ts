// Serves build/client like nginx will: files as they are, every other path gets the SPA shell.
// usage: node e2e/serve.ts [port]

import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseNginxMap } from "../../../tooling/csp.ts"

const ROOT = resolve(fileURLToPath(new URL("../build/client", import.meta.url)))
const PORT = Number(process.argv[2] ?? 4180)
// enforced here (report-only in production) so e2e catches a policy that breaks the app
const csp = parseNginxMap(readFileSync(resolve(ROOT, "../csp.map"), "utf8"))

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

const fileAt = (path: string) => {
  const file = normalize(join(ROOT, path))
  return file.startsWith(ROOT) && existsSync(file) && statSync(file).isFile()
    ? file
    : null
}

createServer((req, res) => {
  const path = decodeURIComponent(
    new URL(req.url ?? "/", "http://localhost").pathname
  )
  const asset = fileAt(path)
  const file = asset ?? join(ROOT, "index.html")
  const type = TYPES[extname(file)] ?? "application/octet-stream"
  res.writeHead(200, {
    "content-type": type,
    ...(type.startsWith("text/html") && {
      "content-security-policy": csp.fallback,
    }),
  })
  createReadStream(file).pipe(res)
}).listen(PORT, () => {
  console.log(`serving ${ROOT} on http://localhost:${PORT}`)
})
