import { HttpError, NetworkError, TimeoutError } from "@workspace/api"
import { useCallback, useEffect, useRef, useState } from "react"

import { checkFile, type FileProblem, type FileRules } from "@/lib/file-rules"

export type UploadFailure = "network" | "tooLarge" | "server"

const failureOf = (error: unknown): UploadFailure =>
  error instanceof NetworkError || error instanceof TimeoutError
    ? "network"
    : error instanceof HttpError && error.status === 413
      ? "tooLarge"
      : "server"

/** The common-namespace message for each failure. */
export const UPLOAD_FAILED = {
  network: "upload.failedNetwork",
  tooLarge: "upload.failedTooLarge",
  server: "upload.failed",
} as const satisfies Record<UploadFailure, string>

export type UploadState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "invalid"; problem: FileProblem }
  | { status: "uploading"; file: File; progress: number }
  | { status: "failed"; file: File; reason: UploadFailure }
  | { status: "done"; file: File }

interface Options {
  rules: FileRules
  value?: File | null
  onSelect?: (file: File | null) => void
  upload?: (
    file: File,
    options: { onProgress: (fraction: number) => void; signal: AbortSignal }
  ) => Promise<unknown>
  onUploaded?: (result: unknown, file: File) => void
  onRemove?: () => void
}

/** Checks a picked or dropped file, uploads it with progress, and keeps it for a retry. */
export function useFileUpload({
  rules,
  value,
  onSelect,
  upload,
  onUploaded,
  onRemove,
}: Options) {
  const controller = useRef<AbortController | null>(null)
  const [state, setState] = useState<UploadState>(
    value ? { status: "selected", file: value } : { status: "idle" }
  )
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => controller.current?.abort(), [])

  const start = async (file: File) => {
    const problem = checkFile(file, rules)
    if (problem) {
      setState({ status: "invalid", problem })
      return
    }
    if (!upload) {
      setState({ status: "selected", file })
      onSelect?.(file)
      return
    }
    controller.current?.abort()
    controller.current = new AbortController()
    setState({ status: "uploading", file, progress: 0 })
    try {
      const result = await upload(file, {
        signal: controller.current.signal,
        onProgress: (progress) => {
          setState({ status: "uploading", file, progress })
        },
      })
      setState({ status: "done", file })
      onUploaded?.(result, file)
    } catch (error) {
      if (controller.current.signal.aborted) return
      setState({ status: "failed", file, reason: failureOf(error) })
    }
  }

  const latestStart = useRef(start)
  useEffect(() => {
    latestStart.current = start
  })

  // native listeners: the label stays a plain label for assistive tech
  const zone = useCallback((label: HTMLLabelElement | null) => {
    if (!label) return
    const over = (event: DragEvent) => {
      event.preventDefault()
      setDragging(true)
    }
    const leave = () => {
      setDragging(false)
    }
    const drop = (event: DragEvent) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer?.files[0]
      if (file) void latestStart.current(file)
    }
    label.addEventListener("dragover", over)
    label.addEventListener("dragleave", leave)
    label.addEventListener("drop", drop)
    return () => {
      label.removeEventListener("dragover", over)
      label.removeEventListener("dragleave", leave)
      label.removeEventListener("drop", drop)
    }
  }, [])

  const remove = () => {
    setState({ status: "idle" })
    onSelect?.(null)
    onRemove?.()
  }

  return { state, dragging, zone, start, remove }
}
