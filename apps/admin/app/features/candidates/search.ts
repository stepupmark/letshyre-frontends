import { User } from "lucide-react"

import type { SearchSource } from "@/lib/search"

import { candidatesService } from "./services/candidates.service"

export const candidateSearch: SearchSource = {
  heading: "Candidates",
  icon: User,
  search: async (term, signal) => {
    const { results } = await candidatesService.list(
      { page: 1, search: term },
      signal
    )
    return results.slice(0, 5).map((candidate) => ({
      id: candidate.id,
      label: candidate.name || "Unnamed",
      detail: candidate.email,
      url: `/dashboard/candidates/${candidate.id}`,
    }))
  },
}
