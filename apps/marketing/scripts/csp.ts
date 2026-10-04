import { createHash } from "node:crypto"

import { inlineScriptsOf } from "./html.ts"

const sha256 = (script: string) =>
  `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`

/**
 * Script policy for one page. frame-ancestors lives in the nginx header, since
 * browsers ignore it in a meta tag.
 */
export function pagePolicy(html: string, apiOrigin: string): string {
  const hashes = [...new Set(inlineScriptsOf(html).map(sha256))]
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")} https://connect.facebook.net`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.facebook.com",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin} https://www.facebook.com https://connect.facebook.net`,
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ].join("; ")
}

export function injectMetaPolicy(html: string, policy: string): string {
  const tag = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`
  return html.replace(/<meta charSet="utf-8"\/>/, (charset) => charset + tag)
}

/** nginx `map` body: request path to its policy. */
export function nginxMap(
  policies: Map<string, string>,
  fallback: string
): string {
  return [
    `default "${fallback}";`,
    ...[...policies].map(([path, policy]) => `"${path}" "${policy}";`),
    "",
  ].join("\n")
}

export function parseNginxMap(map: string): {
  policies: Map<string, string>
  fallback: string
} {
  const policies = new Map<string, string>()
  let fallback = ""
  for (const [, key = "", value = ""] of map.matchAll(
    /^"?([^"\s]+)"? "([^"]*)";$/gm
  )) {
    if (key === "default") fallback = value
    else policies.set(key, value)
  }
  return { policies, fallback }
}
