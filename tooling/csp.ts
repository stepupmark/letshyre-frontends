// CSP and script-size helpers shared by the apps' postbuild scripts.
// Regex is enough: the HTML is React's own output, so attribute order and quoting are stable.

import { createHash } from "node:crypto"

/** Inline scripts the browser executes, i.e. everything CSP has to allow. */
export const inlineScriptsOf = (html: string): string[] =>
  [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs = "", body]) => {
      if (!body || /\ssrc=/.test(attrs)) return false
      const type = /type="([^"]*)"/.exec(attrs)?.[1]
      return !type || ["module", "importmap", "text/javascript"].includes(type)
    })
    .map((m) => m[2] ?? "")

/** `/assets/*.js` the page loads before it's interactive. */
export const initialScriptsOf = (html: string): string[] => [
  ...new Set(
    [
      ...html.matchAll(/<link rel="modulepreload" href="([^"]+\.js)"/g),
      ...html.matchAll(/<script[^>]* src="([^"]+\.js)"/g),
      ...html.matchAll(/import (?:\* as \w+ from )?"([^"]+\.js)"/g),
    ].map((m) => m[1] ?? "")
  ),
]

const sha256 = (script: string) =>
  `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`

export type Sources = Partial<
  Record<"script" | "connect" | "img" | "media" | "frame", string[]>
>

/**
 * Policy for one page: inline scripts by hash plus the extra origins per directive.
 * frame-ancestors belongs in a response header, since browsers ignore it in a meta tag.
 */
export function pagePolicy(html: string, sources: Sources = {}): string {
  const hashes = [...new Set(inlineScriptsOf(html).map(sha256))]
  const directive = (name: string, base: string[], extra: string[] = []) =>
    `${name} ${[...base, ...extra].join(" ")}`

  return [
    "default-src 'self'",
    directive("script-src", ["'self'", ...hashes], sources.script),
    "style-src 'self' 'unsafe-inline'",
    directive("img-src", ["'self'", "data:"], sources.img),
    sources.media && directive("media-src", ["'self'"], sources.media),
    "font-src 'self'",
    directive("connect-src", ["'self'"], sources.connect),
    sources.frame && directive("frame-src", [], sources.frame),
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ]
    .filter(Boolean)
    .join("; ")
}

export function injectMetaPolicy(html: string, policy: string): string {
  const tag = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`
  return html.replace(/<meta charSet="utf-8"\/>/, (charset) => charset + tag)
}

/** `map` body: request path to its policy. */
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
