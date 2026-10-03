import type { PostProcessorModule } from "i18next"

// prettier-ignore
const ACCENTS: Record<string, string> = {
  a: "á", b: "ƀ", c: "ç", d: "ð", e: "é", f: "ƒ", g: "ĝ", h: "ĥ", i: "í",
  j: "ĵ", k: "ĸ", l: "ł", m: "ɱ", n: "ñ", o: "ó", p: "þ", q: "q", r: "ŕ",
  s: "š", t: "ŧ", u: "ú", v: "ṽ", w: "ŵ", x: "ẋ", y: "ý", z: "ž",
  A: "Á", B: "Ɓ", C: "Ç", D: "Ð", E: "É", F: "Ƒ", G: "Ĝ", H: "Ĥ", I: "Í",
  J: "Ĵ", K: "Ķ", L: "Ł", M: "Ṁ", N: "Ñ", O: "Ó", P: "Þ", Q: "Q", R: "Ŕ",
  S: "Š", T: "Ŧ", U: "Ú", V: "Ṽ", W: "Ŵ", X: "Ẋ", Y: "Ý", Z: "Ž",
}

// placeholders and tags must survive untouched
const PRESERVED = /(\{\{[^}]*\}\}|<\/?[a-zA-Z][^>]*>)/g

/** Accents every letter and pads by ~35%, so hardcoded and clipped copy stands out. */
export function pseudoLocalize(value: string): string {
  if (!value) return value
  const parts = value.split(PRESERVED)
  const body = parts
    .map((part, i) =>
      i % 2 ? part : part.replace(/[a-zA-Z]/g, (c) => ACCENTS[c] ?? c)
    )
    .join("")
  const extra = Math.ceil(value.replace(PRESERVED, "").length * 0.35)
  return `⟦${body}${"·".repeat(extra)}⟧`
}

export const pseudoPostProcessor: PostProcessorModule = {
  type: "postProcessor",
  name: "pseudo",
  process: (value: string) => pseudoLocalize(value),
}
