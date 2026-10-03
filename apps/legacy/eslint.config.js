import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const CSS_IMPORT = {
  group: ['*.css', '!*.css?url'],
  message:
    'Side-effect CSS imports bleed globally. Style with Tailwind utilities instead; if you genuinely need a stylesheet, it belongs in app/styles/ and imported from app/root.jsx.',
}

const TOAST_IMPORT = {
  name: 'sonner',
  importNames: ['toast'],
  message: 'Import toast from "@/lib/toast" so durations stay consistent.',
}

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router', 'coverage', '.claude']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Base no-unused-vars doesn't resolve JSX member expressions
      // (`<motion.div>`) or renamed-destructured-param components
      // (`({ icon: Icon }) => <Icon />`) as usages — this rule teaches it to.
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    // React Router framework-mode route modules export a fixed set of
    // conventional names alongside the component. Without this, the
    // react-refresh rule flags every single route file.
    files: ['app/routes/**/*.{js,jsx}', 'app/root.jsx'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: [
            'meta',
            'links',
            'headers',
            'loader',
            'clientLoader',
            'clientMiddleware',
            'middleware',
            'action',
            'clientAction',
            'shouldRevalidate',
            'handle',
            'ErrorBoundary',
            'HydrateFallback',
            'Layout',
          ],
        },
      ],
    },
  },
  {
    // shadcn/ui primitives export their CVA variant function (and, for form,
    // a hook) alongside the component — `buttonVariants`, `badgeVariants`,
    // `useFormField`. That is upstream convention and consumers rely on it for
    // composition, so the react-refresh rule is relaxed for this directory
    // only. These files are vendored: keep them close to upstream so future
    // `shadcn add` runs stay mergeable.
    // Disabled rather than allow-listed: the exported names differ per
    // component and would need updating on every `shadcn add`.
    files: ['app/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    // User-facing copy must come from a catalog, or it ships English to all 19
    // locales. Toasts and aria-labels are the two places it kept slipping
    // through, because neither is visible in a translated page at a glance.
    files: ['app/**/*.{js,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.object.name="toast"] > :matches(Literal, TemplateLiteral)',
          message:
            'Pass a translated string to toast(): useTranslation() and t("namespace.key").',
        },
        {
          selector:
            'CallExpression[callee.object.name="toast"] LogicalExpression > Literal',
          message:
            'The toast fallback is user-facing too — use t("namespace.key") instead of a literal.',
        },
        {
          selector: 'JSXAttribute[name.name="aria-label"] > Literal',
          message:
            'aria-label is read aloud to users — use t("namespace.key") instead of a literal.',
        },
        {
          // alt="" is the correct markup for a decorative image, so only
          // non-empty literals are a problem.
          selector: 'JSXAttribute[name.name="alt"] > Literal[value!=""]',
          message:
            'alt text is read aloud to users — use t("namespace.key"), or alt="" if the image is decorative.',
        },
      ],
    },
  },
  {
    // Side-effect CSS imports get hoisted by Vite into a shared chunk and
    // injected globally and permanently, which is what used to cause
    // cross-route style bleeding. No component stylesheets remain — the rule
    // stays as a ratchet so none come back.
    // app/root.jsx and app/styles/** are the intentional global exception.
    files: ['app/**/*.{js,jsx}'],
    ignores: ['app/root.jsx', 'app/styles/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [TOAST_IMPORT],
          patterns: [CSS_IMPORT],
        },
      ],
    },
  },
  {
    // The one place that wraps sonner.
    files: ['app/lib/toast.js', 'app/lib/toast.test.js'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [CSS_IMPORT] }],
    },
  },
])
