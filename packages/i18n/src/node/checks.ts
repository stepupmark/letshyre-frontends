import type { Locale } from "../config.ts"
import type { Catalog } from "../create-i18n.ts"

export type IssueKind = "missing" | "placeholders" | "plural" | "extra"

export interface Issue {
  locale: Locale
  ns: string
  key: string
  kind: IssueKind
}

/** These block a page from being ready in a locale. */
export const BLOCKING: ReadonlySet<IssueKind> = new Set([
  "missing",
  "placeholders",
  "plural",
])

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/
const PLACEHOLDER =
  /\{\{\s*([\w.]+)[^}]*\}\}|<\/?([a-zA-Z][\w-]*)[^>]*>|\$t\(([^)]+)\)/g

export function flatten(catalog: Catalog, prefix = ""): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") out.set(path, value)
    else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "string") out.set(`${path}.${i}`, item)
        else for (const [k, v] of flatten(item, `${path}.${i}`)) out.set(k, v)
      })
    } else for (const [k, v] of flatten(value, path)) out.set(k, v)
  }
  return out
}

export function placeholders(value: string): string[] {
  const found = new Set<string>()
  for (const m of value.matchAll(PLACEHOLDER)) {
    found.add(m[1] ? `{{${m[1]}}}` : m[2] ? `<${m[2]}>` : `$t(${m[3] ?? ""})`)
  }
  return [...found].sort()
}

export function pluralCategories(locale: Locale): string[] {
  return new Intl.PluralRules(locale).resolvedOptions().pluralCategories
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

/** Compares one namespace of a locale against English. */
export function checkCatalog(
  locale: Locale,
  ns: string,
  english: Catalog,
  target: Catalog = {}
): Issue[] {
  const en = flatten(english)
  const tr = flatten(target)
  const issues: Issue[] = []
  const issue = (key: string, kind: IssueKind) =>
    issues.push({ locale, ns, key, kind })

  const plurals = new Map<string, string>()
  for (const [key, value] of en) {
    const base = key.replace(PLURAL_SUFFIX, "")
    if (base !== key) {
      if (key.endsWith("_other")) plurals.set(base, value)
      continue
    }
    const translated = tr.get(key)
    if (translated === undefined) issue(key, "missing")
    else if (!sameSet(placeholders(value), placeholders(translated)))
      issue(key, "placeholders")
  }

  const required = pluralCategories(locale)
  for (const [base, other] of plurals) {
    const forms = required.map((cat) => tr.get(`${base}_${cat}`))
    if (forms.every((f) => f === undefined)) {
      issue(base, "missing")
      continue
    }
    if (forms.some((f) => f === undefined)) issue(base, "plural")
    // a form may drop {{count}} ("one credit"), but nothing else
    const expected = placeholders(other).filter((p) => p !== "{{count}}")
    const ok = forms.every((form) => {
      if (form === undefined) return true
      const got = placeholders(form).filter((p) => p !== "{{count}}")
      return sameSet(expected, got)
    })
    if (!ok) issue(base, "placeholders")
  }

  if (target !== english) {
    for (const key of tr.keys()) {
      const base = key.replace(PLURAL_SUFFIX, "")
      if (!en.has(key) && !plurals.has(base)) issue(key, "extra")
    }
  }

  return issues
}

/**
 * Keys that never appear quoted in the sources. A quoted parent path counts as a use,
 * which covers `returnObjects` lists and keys built from a prefix.
 */
export function findUnusedKeys(
  catalogs: ReadonlyMap<string, Catalog>,
  sources: readonly string[]
): string[] {
  const quoted = new Set<string>()
  for (const source of sources) {
    for (const m of source.matchAll(/["'`]([\w.:-]+)/g)) quoted.add(m[1] ?? "")
  }

  const unused: string[] = []
  for (const [ns, catalog] of catalogs) {
    for (const key of flatten(catalog).keys()) {
      const parts = key.replace(PLURAL_SUFFIX, "").split(".")
      const used = parts.some((_, i) => {
        const path = parts.slice(0, i + 1).join(".")
        return quoted.has(path) || quoted.has(`${ns}:${path}`)
      })
      if (!used) unused.push(`${ns}:${key}`)
    }
  }
  return unused
}
