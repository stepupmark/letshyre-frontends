// Serves build/client the way production will (docs/baseline/url-contract.md).
// usage: node e2e/serve.ts [port]

import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createGzip } from "node:zlib"

import { parseNginxMap } from "../../../tooling/csp.ts"

const ROOT = resolve(fileURLToPath(new URL("../build/client", import.meta.url)))
const PORT = Number(process.argv[2] ?? 4173)
const CSP_MAP = resolve(ROOT, "../csp.map")
// enforced here (report-only in production) so e2e catches a policy that breaks the page
const csp = existsSync(CSP_MAP)
  ? parseNginxMap(readFileSync(CSP_MAP, "utf8"))
  : undefined

const LOCALES = "en|hi|fr|ja|ar|te|ta|es|nl|ru|kn|ml|ur|bn|de|pt|it|ko|id"
const LOCALE_PAGE = new RegExp(`^/(${LOCALES})((?:/[a-z0-9-]+){1,3})?$`)

// the nginx map lines postbuild writes: `~^regex$ /target;` or `/exact /target;`
const redirectsIn = (name: string) => {
  const file = resolve(ROOT, "..", name)
  if (!existsSync(file)) return []
  return readFileSync(file, "utf8")
    .split("\n")
    .flatMap((line) => {
      const [from, to] = line.replace(/;$/, "").split(" ")
      if (!from || !to) return []
      return [
        from.startsWith("~")
          ? { match: new RegExp(from.slice(1)), to }
          : { match: new RegExp(`^${from}$`), to },
      ]
    })
}
const PERMANENT = redirectsIn("redirects.map")
const TEMPORARY = redirectsIn("redirects-temporary.map")
const redirectFor = (
  rules: ReturnType<typeof redirectsIn>,
  path: string
): string | undefined => {
  const rule = rules.find(({ match }) => match.test(path))
  return rule && path.replace(rule.match, rule.to)
}

// url-contract §5: what the host sends with every response
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
}

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
    // like production gzip, so Lighthouse measures real transfer sizes
    const gzip =
      /^(text|application\/(json|xml|manifest))/.test(type) &&
      /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")
    res.writeHead(status, {
      ...SECURITY_HEADERS,
      "content-type": type,
      ...(gzip && { "content-encoding": "gzip", vary: "accept-encoding" }),
      ...(policy && {
        "content-security-policy": `${policy}; frame-ancestors 'none'`,
      }),
    })
    const stream = createReadStream(file)
    if (gzip) stream.pipe(createGzip()).pipe(res)
    else stream.pipe(res)
  }
  const redirect = (status: number, to: string) =>
    res.writeHead(status, { location: to + url.search }).end()

  if (path === "/") return redirect(301, "/en")
  if (path.length > 1 && path.endsWith("/"))
    return redirect(301, path.slice(0, -1))

  const asset = fileAt(path)
  if (asset) return send(200, asset)

  const moved = redirectFor(PERMANENT, path)
  if (moved) return redirect(301, moved)
  const elsewhere = redirectFor(TEMPORARY, path)
  if (elsewhere) return redirect(302, elsewhere)

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
