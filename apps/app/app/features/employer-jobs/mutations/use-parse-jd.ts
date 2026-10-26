import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"

import { industriesQuery } from "@/lib/industries"

import { fromParsed } from "../lib/job-mapping"
import { parseJd } from "../services/employer-jobs.service"

export type ReadStage = "uploading" | "reading"

/** Uploads the JD and maps what the AI found onto the form, with progress and cancel. */
export function useParseJd() {
  const queryClient = useQueryClient()
  const controller = useRef<AbortController | null>(null)
  const [stage, setStage] = useState<ReadStage>("uploading")
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      controller.current = new AbortController()
      setStage("uploading")
      setProgress(0)
      // industries must be loaded to map the JD's industry onto a choice
      const [jd, industries] = await Promise.all([
        parseJd(file, title, {
          signal: controller.current.signal,
          onProgress: (fraction) => {
            setProgress(fraction)
            if (fraction >= 1) setStage("reading")
          },
        }),
        queryClient.query({ ...industriesQuery(), staleTime: "static" }),
      ])
      return fromParsed(jd, title, industries)
    },
  })

  const cancel = () => {
    controller.current?.abort()
    mutation.reset()
  }

  return { ...mutation, stage, progress, cancel }
}
