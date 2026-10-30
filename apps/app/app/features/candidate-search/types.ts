export interface SearchFilters {
  min: number | null
  max: number | null
  education: string
  location: string
}

export interface SearchParams extends SearchFilters {
  search: string
  page: number
}

export type SearchChange = Partial<SearchParams>
