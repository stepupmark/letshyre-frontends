export interface UnlockedFilters {
  skills: string[]
  min: number | null
  max: number | null
}

export interface UnlockedParams {
  page: number
  limit: number
  filters: UnlockedFilters
}
