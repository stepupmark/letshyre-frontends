// Runs inside the MDX compiler (vite.config.ts), so no Vite-only imports.

export const MDX_COMPONENTS = [
  "Callout",
  "Compare",
  "Feature",
  "Figure",
  "Quote",
  "Stat",
  "Step",
  "Steps",
  "VideoEmbed",
] as const

export const CALLOUT_TONES = ["note", "tip", "warning"] as const
export const FEATURE_AUDIENCES = ["employers", "candidates"] as const

type Component = (typeof MDX_COMPONENTS)[number]

const isOneOf = (list: readonly string[], value: unknown) =>
  list.includes(String(value))

// props a component can't render without; Figure's size stops the page shifting as images load
const REQUIRED: Partial<Record<Component, string[]>> = {
  Compare: ["avoid", "prefer"],
  Feature: ["audience"],
  Figure: ["src", "alt", "width", "height"],
  Quote: ["by"],
  Stat: ["value", "label", "source", "cite"],
  Step: ["title"],
  VideoEmbed: ["id", "title", "poster"],
}

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
      const attr = (key: string) =>
        node.attributes?.find((a) => a.name === key)?.value
      const missing = REQUIRED[name as Component]?.find((key) => {
        const value = attr(key)
        return value == null || (typeof value === "string" && !value.trim())
      })
      if (missing) return `<${name}> needs ${missing}`
      if (name === "Stat" && !String(attr("source")).startsWith("https://"))
        return "<Stat> source must be an https link to the study"
      if (name === "VideoEmbed" && !/^[\w-]{11}$/.test(String(attr("id"))))
        return "<VideoEmbed> id must be the 11-character YouTube id"
      if (
        name === "Callout" &&
        attr("tone") != null &&
        !isOneOf(CALLOUT_TONES, attr("tone"))
      )
        return `<Callout> tone is one of ${CALLOUT_TONES.join(", ")}`
      if (name === "Feature" && !isOneOf(FEATURE_AUDIENCES, attr("audience")))
        return `<Feature> audience is one of ${FEATURE_AUDIENCES.join(", ")}`
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
