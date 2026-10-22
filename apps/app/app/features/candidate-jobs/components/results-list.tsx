import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { useDelayed } from "@/hooks/use-delayed"
import { duration, ease, spring } from "@/lib/motion"

import { type Job } from "../schemas/candidate-jobs.schema"
import { JobCard } from "./job-card"

// six cards at 30 ms keeps the last one inside the 400 ms budget
const STAGGER = 0.03
const STAGGERED = 6

export function ResultsList({
  jobs,
  query,
  stale,
  onOpen,
}: {
  jobs: Job[]
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
                  delay: Math.min(i, STAGGERED - 1) * STAGGER,
                },
              }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
              transition={spring}
            >
              <JobCard
                job={job}
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

export function LoadingBar({ active }: { active: boolean }) {
  const shown = useDelayed(active, 150)
  return (
    <AnimatePresence>
      {shown && (
        <m.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast }}
          className="absolute inset-x-0 -top-2 h-0.5 overflow-hidden rounded-full bg-muted rtl:-scale-x-100"
        >
          <m.span
            className="block h-full w-1/3 rounded-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}

export function ResultsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="size-11 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </li>
      ))}
    </ul>
  )
}
