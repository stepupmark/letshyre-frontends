import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useSearchParams } from "react-router"

import { chosenJob, toChoice } from "../lib/job-choice"
import { jobQuery, jobsQuery } from "../queries/employer-jobs.queries"

const JOB = "jobId"

// the open job in ?jobId=, defaulting to the first one; changing it clears `reset`
export function useJobParam(reset: readonly string[]) {
  const [search, setSearch] = useSearchParams()
  const jobs = useQuery(jobsQuery({ page: 1, tab: "open" }))
  const open = jobs.data?.results ?? []
  const wanted = search.get(JOB)
  const jobId = chosenJob(wanted, open)
  const listed = open.some((job) => job.id === jobId)
  // a shared link can point at a job that isn't on the first page, or isn't open
  const linked = useQuery({
    ...jobQuery(jobId ?? ""),
    enabled: Boolean(jobId) && jobs.isSuccess && !listed,
  })

  useEffect(() => {
    if (jobId && jobId !== wanted)
      setSearch(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(JOB, jobId)
          return next
        },
        { replace: true }
      )
  }, [jobId, wanted, setSearch])

  const choose = (id: string) => {
    setSearch(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(JOB, id)
        for (const name of reset) next.delete(name)
        return next
      },
      { replace: true, preventScrollReset: true }
    )
  }

  return {
    jobs,
    jobId,
    choices: [...open, ...(linked.data && !listed ? [linked.data] : [])].map(
      toChoice
    ),
    pending: jobs.isPending || linked.isLoading,
    missing: !listed && linked.isError,
    firstOpen: open[0]?.id,
    choose,
  }
}
