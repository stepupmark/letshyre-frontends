import { Briefcase } from "lucide-react"
import type { SearchSource } from "@/lib/search"
import { jobsService } from "./services/jobs.service"

export const jobSearch: SearchSource = {
  heading: "Jobs",
  icon: Briefcase,
  search: async (term, signal) => {
    const { results } = await jobsService.list(
      { page: 1, search: term },
      signal
    )
    return results.slice(0, 5).map((job) => ({
      id: job.id,
      label: job.title || "Untitled job",
      detail: job.company_name,
      url: `/dashboard/jobs/${job.id}`,
    }))
  },
}
