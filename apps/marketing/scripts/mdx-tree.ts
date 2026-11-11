// The parts of an MDX syntax tree the blog checks read.

export interface Node {
  type: string
  name?: string | null
  value?: string
  depth?: number
  url?: string
  position?: { start: { line: number } }
  attributes?: { name?: string; value?: unknown }[]
  children?: Node[]
}

export function walk(node: Node, visit: (node: Node) => void) {
  visit(node)
  node.children?.forEach((child) => {
    walk(child, visit)
  })
}

export const lineOf = (node: Node) => node.position?.start.line

export const textOf = (node: Node): string =>
  node.type === "text" || node.type === "inlineCode"
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("")

export const attr = (node: Node, name: string): string | undefined => {
  const value = node.attributes?.find((a) => a.name === name)?.value
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "value" in value)
    return String(value.value)
  return undefined
}
