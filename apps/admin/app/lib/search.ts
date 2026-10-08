import type { LucideIcon } from "lucide-react"

interface SearchHit {
  id: string
  label: string
  detail?: string | null | undefined
  url: string
}

/** A group of results in the command palette, provided by the feature that owns the data. */
export interface SearchSource {
  heading: string
  icon: LucideIcon
  search: (term: string, signal: AbortSignal) => Promise<SearchHit[]>
}
