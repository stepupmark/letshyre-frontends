const CLASS_TOKEN = /^[!\w:\-[\]/.%#()_,&>*@=']+$/
const HAS_UTILITY = /[-:]/

export function looksLikeClassList(value) {
  const tokens = value.trim().split(/\s+/)
  if (tokens.length < 3) return false
  if (!tokens.every((t) => CLASS_TOKEN.test(t))) return false
  return tokens.filter((t) => HAS_UTILITY.test(t)).length >= 2
}

const STORED_IN = new Set([
  "VariableDeclarator",
  "Property",
  "PropertyDefinition",
  "ReturnStatement",
  "ArrayExpression",
  "AssignmentExpression",
  "ArrowFunctionExpression",
])

function isInlineUse(node) {
  let stored = false
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "JSXAttribute") return true
    if (STORED_IN.has(parent.type)) stored = true
  }
  return !stored
}

/** @type {import("eslint").Rule.RuleModule} */
export const noClassConstants = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Keep Tailwind classes inline on the element instead of in variables",
    },
    messages: {
      inline:
        "Put Tailwind classes inline on the element. Extract a component if the markup repeats.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, value) => {
      if (
        typeof value === "string" &&
        looksLikeClassList(value) &&
        !isInlineUse(node)
      ) {
        context.report({ node, messageId: "inline" })
      }
    }
    return {
      Literal(node) {
        check(node, node.value)
      },
      TemplateLiteral(node) {
        if (node.expressions.length === 0)
          check(node, node.quasis[0]?.value.cooked)
      },
    }
  },
}
