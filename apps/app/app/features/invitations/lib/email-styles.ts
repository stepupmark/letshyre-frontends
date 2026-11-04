const ALLOWED = new Set([
  "background",
  "background-color",
  "border",
  "border-color",
  "border-radius",
  "border-style",
  "border-width",
  "color",
  "display",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-width",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "text-align",
  "text-decoration",
  "width",
])

const UNSAFE = /url\s*\(|expression\s*\(|javascript:|@import|[<>]/i

/** Keeps the inline CSS an email needs; returns the input untouched when nothing is dropped. */
export function safeStyle(style: string | null | undefined): string | null {
  if (!style?.trim()) return null
  const declarations = style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
  const kept = declarations.filter((declaration) => {
    const colon = declaration.indexOf(":")
    if (colon < 1) return false
    const property = declaration.slice(0, colon).trim().toLowerCase()
    return ALLOWED.has(property) && !UNSAFE.test(declaration)
  })
  if (kept.length === declarations.length) return style
  return kept.length ? `${kept.join(";")};` : null
}

// the DOM rewrites style values (#111 → rgb(17, 17, 17)), so the exact string rides along
export const styled = (style: string | null) =>
  style ? { style, "data-style": style } : {}

export const BUTTON_WRAP = "text-align:center;margin:24px 0;"

export const BUTTON_TONES = {
  primary:
    "display:inline-block;background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;",
  dark: "display:inline-block;background-color:#0f172a;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;",
} as const

export type ButtonTone = keyof typeof BUTTON_TONES

export const toneOf = (style: string): ButtonTone =>
  /#0f172a/i.test(style) ? "dark" : "primary"

export const CALLOUT =
  "margin:20px 0 12px 0;padding:14px 16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;text-align:center;"

export const isButtonStyle = (style: string | null) =>
  Boolean(style && /background(-color)?\s*:/i.test(style))
