import { readFileSync } from "node:fs"
import { createServer } from "node:http"
import sirv from "sirv"
import { CLIENT_DIR, IMMUTABLE, securityHeaders } from "./security-headers.mjs"

// same headers as production so CSP problems show up locally; HSTS and https upgrades don't apply on localhost
const headers = securityHeaders(readFileSync(`${CLIENT_DIR}index.html`, "utf8"))
delete headers["Strict-Transport-Security"]
headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace(
  "; upgrade-insecure-requests",
  ""
)

const serve = sirv(CLIENT_DIR, {
  single: true,
  setHeaders(res, pathname) {
    res.setHeader(
      "Cache-Control",
      pathname.startsWith("/assets/") ? IMMUTABLE : "no-cache"
    )
  },
})

const port = Number(process.env.PORT) || 4173
createServer((req, res) => {
  for (const [name, value] of Object.entries(headers))
    res.setHeader(name, value)
  serve(req, res)
}).listen(port, "localhost", () =>
  console.log(`Preview on http://localhost:${port}`)
)
