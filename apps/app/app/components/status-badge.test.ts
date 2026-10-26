import { readFileSync } from "node:fs"
import { expect, test } from "vitest"

const lightTheme = readFileSync(
  new URL("../../../../packages/ui/src/styles/globals.css", import.meta.url),
  "utf8"
).replace(/^\.dark \{[\s\S]*?^\}/gm, "")
const source = readFileSync(
  new URL("./status-badge.tsx", import.meta.url),
  "utf8"
)

// light-theme value of a token like --success
function luminance(token: string) {
  const match = lightTheme
    .split("\n")
    .find((line) => line.trim().startsWith(`--${token}:`))
    ?.match(/oklch\(([\d.]+)(%?) ([\d.]+) ([\d.]+)\)/)
  if (!match) throw new Error(`no oklch value for --${token}`)
  const L = Number(match[1]) / (match[2] ? 100 : 1)
  const C = Number(match[3])
  const h = (Number(match[4]) * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
  return (
    0.2126 * (rgb[0] ?? 0) + 0.7152 * (rgb[1] ?? 0) + 0.0722 * (rgb[2] ?? 0)
  )
}

const classes = new Map<string, string>()
for (const [, tone, kind, token] of source.matchAll(
  /data-\[tone=(\w+)\]:(bg|text)-([a-z-]+)/g
)) {
  if (tone && kind && token) classes.set(`${tone}:${kind}`, token)
}

test.each(["success", "warning", "danger", "info", "neutral"])(
  "%s badge text meets WCAG AA on its background",
  (tone) => {
    const bg = classes.get(`${tone}:bg`)
    const fg = classes.get(`${tone}:text`)
    if (!bg || !fg) throw new Error(`${tone} needs a bg and a text class`)

    const [light = 0, dark = 0] = [luminance(bg), luminance(fg)].sort(
      (x, y) => y - x
    )
    expect((light + 0.05) / (dark + 0.05)).toBeGreaterThanOrEqual(4.5)
  }
)
