export interface FileRules {
  /** extensions with the dot, e.g. [".pdf", ".docx"] */
  accept: readonly string[]
  maxBytes: number
}

export type FileProblem =
  { kind: "tooLarge"; size: number; max: number } | { kind: "wrongType" }

const extension = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot).toLowerCase() : ""
}

/** Checked before upload, so a wrong file never costs a round trip. */
export function checkFile(
  file: Pick<File, "name" | "size">,
  rules: FileRules
): FileProblem | null {
  if (!rules.accept.includes(extension(file.name))) return { kind: "wrongType" }
  if (file.size > rules.maxBytes)
    return { kind: "tooLarge", size: file.size, max: rules.maxBytes }
  return null
}

export function formatBytes(bytes: number, locale: string) {
  const mb = bytes / (1024 * 1024)
  return mb >= 1
    ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(mb)} MB`
    : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(bytes / 1024)} KB`
}
