// Dev-only pseudo-localization: run `pnpm dev:pseudo` and every translated
// string renders accented and ~35% longer, wrapped in brackets. Two things
// fall out immediately — copy that isn't wrapped in brackets is hardcoded
// English, and any layout that clips is one German or Russian string away
// from breaking in production.
//
// Placeholders and markup are left alone so interpolation and <Trans> still
// work; only the prose between them is transformed.

const ACCENTS = {
  a: "á", b: "ƀ", c: "ç", d: "ð", e: "é", f: "ƒ", g: "ĝ", h: "ĥ", i: "í",
  j: "ĵ", k: "ĸ", l: "ł", m: "ɱ", n: "ñ", o: "ó", p: "þ", q: " q", r: "ŕ",
  s: "š", t: "ŧ", u: "ú", v: "ṽ", w: "ŵ", x: "ẋ", y: "ý", z: "ž",
  A: "Á", B: "Ɓ", C: "Ç", D: "Ð", E: "É", F: "Ƒ", G: "Ĝ", H: "Ĥ", I: "Í",
  J: "Ĵ", K: "ĸ", L: "Ł", M: "Ṁ", N: "Ñ", O: "Ó", P: "Þ", Q: "Q", R: "Ŕ",
  S: "Š", T: "Ŧ", U: "Ú", V: "Ṽ", W: "Ŵ", X: "Ẋ", Y: "Ý", Z: "Ž",
};

// {{count}} and <b>…</b> must survive verbatim, so split the string on them
// and only transform what's left.
const PRESERVED = /(\{\{[^}]*\}\}|<\/?[a-zA-Z][^>]*>)/g;

const accent = (s) => s.replace(/[a-zA-Z]/g, (c) => ACCENTS[c] ?? c);

// Enough padding to expose a layout that only just fits the English.
const pad = (s) => {
  const extra = Math.ceil(s.replace(PRESERVED, "").length * 0.35);
  return extra > 0 ? `${s}${"·".repeat(extra)}` : s;
};

export const pseudoPostProcessor = {
  type: "postProcessor",
  name: "pseudo",
  process(value) {
    if (typeof value !== "string" || !value) return value;
    const body = value
      .split(PRESERVED)
      .map((part, i) => (i % 2 ? part : accent(part)))
      .join("");
    return `⟦${pad(body)}⟧`;
  },
};

export const PSEUDO_ENABLED = import.meta.env?.VITE_PSEUDO === "1";
