// Regex is enough here: the HTML is React's own output, so attribute order and quoting are stable.

const decode = (s: string) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")

const first = (html: string, re: RegExp) => decode(re.exec(html)?.[1] ?? "")

export const titleOf = (html: string) => first(html, /<title>([^<]*)<\/title>/)

export const metaOf = (html: string, key: string) =>
  first(
    html,
    new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`, "i")
  )

export const canonicalOf = (html: string) =>
  first(html, /<link rel="canonical" href="([^"]*)"/)

export const alternatesOf = (html: string): Map<string, string> =>
  new Map(
    [
      ...html.matchAll(
        /<link rel="alternate" hrefLang="([^"]+)" href="([^"]*)"/g
      ),
    ].map((m) => [m[1] ?? "", decode(m[2] ?? "")])
  )

export const jsonLdOf = (html: string): string[] =>
  [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ].map((m) => m[1] ?? "")

export const h1Count = (html: string) => (html.match(/<h1[\s>]/g) ?? []).length
