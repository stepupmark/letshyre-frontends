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

const local = { rules: { "no-class-constants": noClassConstants } }

/** @param {{ tsconfigRootDir?: string, tailwindEntryPoint?: string }} [options] */
export function react({
  tsconfigRootDir,
  tailwindEntryPoint = DEFAULT_TAILWIND_ENTRY,
} = {}) {
  return defineConfig(
    base({ tsconfigRootDir }),
    {
      files: ["**/*.{ts,tsx}"],
      extends: [
        reactHooks.configs.flat["recommended-latest"],
        jsxA11y.flatConfigs.strict,
      ],
      plugins: {
        "react-refresh": reactRefresh,
        "better-tailwindcss": betterTailwind,
        i18next,
        local,
      },
      settings: {
        "better-tailwindcss": { entryPoint: tailwindEntryPoint },
      },
      rules: {
        "react-refresh/only-export-components": [
          "error",
          { allowConstantExport: true },
        ],

        "better-tailwindcss/no-conflicting-classes": "error",
        "better-tailwindcss/no-duplicate-classes": "error",
        "better-tailwindcss/no-unknown-classes": "error",
        "better-tailwindcss/no-deprecated-classes": "error",
        "better-tailwindcss/no-unnecessary-whitespace": "error",
        "better-tailwindcss/enforce-canonical-classes": "error",
        "better-tailwindcss/enforce-logical-properties": "error",
        "better-tailwindcss/no-restricted-classes": [
          "error",
          { restrict: restrictedClasses },
        ],

        "i18next/no-literal-string": [
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
        ],

        "local/no-class-constants": "error",
      },
    },
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/e2e/**"],
      rules: {
        "i18next/no-literal-string": "off",
        "local/no-class-constants": "off",
      },
    }
  )
}
