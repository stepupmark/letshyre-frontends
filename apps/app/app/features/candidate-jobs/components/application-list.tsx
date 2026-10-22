import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { duration, ease, spring } from "@/lib/motion"

import { type Stage } from "../lib/applications"
import { type Job } from "../schemas/candidate-jobs.schema"
import { ApplicationCard } from "./application-card"
import { LoadingBar } from "./results-list"

export function ApplicationList({
  jobs,
  stage,
  query,
  stale,
  onOpen,
}: {
  jobs: Job[]
  stage: Stage
  query: string
  stale: boolean
  onOpen: (id: string) => void
}) {
  return (
    <div className="relative">
      <LoadingBar active={stale} />
      <ul
        aria-busy={stale}
        className={cn(
          "flex flex-col gap-3 transition-opacity duration-200",
          stale && "opacity-70"
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {jobs.map((job, i) => (
            <m.li
              key={job.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: duration.base,
                  ease,
                  delay: Math.min(i, 5) * 0.03,
                },
              }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
              transition={spring}
            >
              <ApplicationCard
                job={job}
                stage={stage}
                query={query}
                onOpen={() => {
                  onOpen(job.id)
                }}
              />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export function ApplicationsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="size-11 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-px flex-1" />
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-px flex-1" />
            <Skeleton className="size-4 rounded-full" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <div className="flex justify-between border-t pt-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}
