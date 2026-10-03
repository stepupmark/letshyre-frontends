import { RuleTester } from "eslint"
import { describe, it } from "vitest"
import { noClassConstants } from "../src/rules/no-class-constants.js"

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

tester.run("no-class-constants", noClassConstants, {
  valid: [
    `<div className="flex items-center gap-2 px-4" />`,
    `<div className={cn("flex items-center gap-2", active && "bg-muted text-foreground")} />`,
    `<Card classNames={{ root: "flex items-center gap-2" }} />`,
    `const title = "Pay only for the candidates you unlock"`,
    `const url = "https://letshyre.ai/en/pricing"`,
    `const key = "pricing:plans.buy"`,
  ],
  invalid: [
    {
      code: `const card = "rounded-lg border px-4 py-2"`,
      errors: [{ messageId: "inline" }],
    },
    {
      code: "const card = `rounded-lg border px-4 py-2`",
      errors: [{ messageId: "inline" }],
    },
    {
      code: `const styles = { primary: "bg-primary text-primary-foreground hover:bg-primary/80" }`,
      errors: [{ messageId: "inline" }],
    },
    {
      code: `const cls = cn("flex items-center gap-2")`,
      errors: [{ messageId: "inline" }],
    },
    {
      code: `function classes() { return "flex items-center gap-2" }`,
      errors: [{ messageId: "inline" }],
    },
  ],
})
