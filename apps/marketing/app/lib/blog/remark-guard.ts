// Runs inside the MDX compiler (vite.config.ts), so no Vite-only imports.

export const MDX_COMPONENTS = ["Figure", "Callout"] as const

interface Node {
  type: string
  name?: string | null
  value?: string
  attributes?: { type: string; name?: string; value?: unknown }[]
  children?: Node[]
}

interface File {
  fail(reason: string, parent: Node): never
}

const LOCAL_IMAGE = /^import \w+ from "\.\/[\w-]+\.(svg|png|jpe?g|webp|avif)"$/

function problemOf(node: Node): string | undefined {
  switch (node.type) {
    case "mdxjsEsm":
      return node.value
        ?.trim()
        .split("\n")
        .every((line) => LOCAL_IMAGE.test(line.trim().replace(/;$/, "")))
        ? undefined
        : "posts may only import local images"
    case "mdxFlowExpression":
    case "mdxTextExpression":
      return "posts can't run code; use a component"
    case "image":
      return "use <Figure> with an imported image, not a Markdown image"
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      const name = node.name ?? ""
      if (!(MDX_COMPONENTS as readonly string[]).includes(name))
        return `<${name}> isn't in the blog's component set`
      if (name !== "Figure") return undefined
      const attr = (key: string) =>
        node.attributes?.find((a) => a.name === key)?.value
      const alt = attr("alt")
      if (typeof alt !== "string" || !alt.trim())
        return "<Figure> needs alt text"
      if (attr("width") == null || attr("height") == null)
        return "<Figure> needs width and height, or the page shifts as it loads"
      return undefined
    }
    default:
      return undefined
  }
}

/** Fails the build on anything a post shouldn't contain (ADR 0021). */
export const remarkGuard = () => (tree: Node, file: File) => {
  const walk = (node: Node) => {
    const problem = problemOf(node)
    if (problem) file.fail(problem, node)
    node.children?.forEach(walk)
  }
  walk(tree)
}
