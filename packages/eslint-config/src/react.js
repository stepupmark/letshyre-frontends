import { fileURLToPath } from "node:url"
import betterTailwind from "eslint-plugin-better-tailwindcss"
import i18next from "eslint-plugin-i18next"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig } from "eslint/config"
import { base } from "./base.js"
import { noClassConstants } from "./rules/no-class-constants.js"

const DEFAULT_TAILWIND_ENTRY = fileURLToPath(
  new URL("../../ui/src/styles/globals.css", import.meta.url)
)

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white"
const COLOR_UTILITIES =
  "bg|text|border(?:-[xytrblse])?|ring|ring-offset|outline|fill|stroke|decoration|divide|placeholder|caret|accent|shadow|inset-shadow|drop-shadow|from|via|to"

export const restrictedClasses = [
  {
    pattern: `^(?:.*:)?(?:${COLOR_UTILITIES})-(?:${PALETTE})(?:-\\d+)?(?:/\\d+)?$`,
    message:
      "Use a theme token (bg-background, text-muted-foreground, border-border, ...) instead of a palette color.",
  },
  {
    pattern:
      "^(?:.*:)?[\\w-]+-\\[(?:#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|color-mix\\()",
    message: "Use a theme token instead of an arbitrary color.",
  },
]

// RTL only flips the inline axis, so sizing and top/bottom stay physical
const directionNeutral = [
  "^(?:.*:)?-?(?:min-|max-)?[wh]-",
  "^(?:.*:)?size-",
  "^(?:.*:)?-?(?:scroll-)?[pm][tb]-",
  "^(?:.*:)?-?(?:top|bottom)-",
  "^(?:.*:)?border-[tb](?:-|$)",
  "^(?:.*:)?rounded-[tb](?:-|$)",
]

const local = { rules: { "no-class-constants": noClassConstants } }

const literalStringRule = [
  "error",
  {
    mode: "jsx-only",
    "jsx-attributes": {
      exclude: [
        "className",
        "style",
        "type",
        "key",
        "id",
        "width",
        "height",
        "href",
        "to",
        "src",
        "srcSet",
        "sizes",
        "rel",
        "target",
        "role",
        "name",
        "htmlFor",
        "autoComplete",
        "inputMode",
        "variant",
        "size",
        "side",
        "align",
        "orientation",
        "dir",
        "lang",
        "loading",
        "decoding",
        "fetchPriority",
        "method",
        "as",
        "data-.*",
        "aria-hidden",
        "aria-live",
        "aria-current",
      ],
    },
  },
]

const tailwindRules = {
  "better-tailwindcss/no-conflicting-classes": "error",
  "better-tailwindcss/no-duplicate-classes": "error",
  "better-tailwindcss/no-unknown-classes": "error",
  "better-tailwindcss/no-deprecated-classes": "error",
  "better-tailwindcss/no-unnecessary-whitespace": "error",
  "better-tailwindcss/enforce-canonical-classes": "error",
  "better-tailwindcss/enforce-logical-properties": [
    "error",
    { ignore: directionNeutral },
  ],
  "better-tailwindcss/no-restricted-classes": [
    "error",
    { restrict: restrictedClasses },
  ],
}

/**
 * `library` is for packages: no fast-refresh rule, and no Tailwind rules unless
 * the package ships markup (`tailwind: true`).
 * @param {{ tsconfigRootDir?: string, tailwindEntryPoint?: string, library?: boolean, tailwind?: boolean }} [options]
 */
export function react({
  tsconfigRootDir,
  tailwindEntryPoint = DEFAULT_TAILWIND_ENTRY,
  library = false,
  tailwind = !library,
} = {}) {
  return defineConfig(
    base({ tsconfigRootDir }),
    {
      files: ["**/*.{ts,tsx}"],
      extends: [
        reactHooks.configs.flat["recommended-latest"],
        jsxA11y.flatConfigs.strict,
      ],
      plugins: { i18next, local },
      rules: {
        "i18next/no-literal-string": literalStringRule,
        "local/no-class-constants": "error",
      },
    },
    library
      ? []
      : {
          files: ["**/*.{ts,tsx}"],
          plugins: { "react-refresh": reactRefresh },
          rules: {
            "react-refresh/only-export-components": [
              "error",
              { allowConstantExport: true },
            ],
          },
        },
    tailwind
      ? {
          files: ["**/*.{ts,tsx}"],
          plugins: { "better-tailwindcss": betterTailwind },
          settings: {
            "better-tailwindcss": { entryPoint: tailwindEntryPoint },
          },
          rules: tailwindRules,
        }
      : [],
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/e2e/**"],
      rules: {
        "i18next/no-literal-string": "off",
        "local/no-class-constants": "off",
      },
    }
  )
}
