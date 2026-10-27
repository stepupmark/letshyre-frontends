export interface UnlockedFilters {
  skills: string[]
  min: number | null
  max: number | null
}

// a function reads the latest URL, which an earlier change may not have reached yet
export type FilterChange =
  | Partial<UnlockedFilters>
  | ((current: UnlockedFilters) => Partial<UnlockedFilters>)

export interface UnlockedParams {
  page: number
  limit: number
  filters: UnlockedFilters
}
