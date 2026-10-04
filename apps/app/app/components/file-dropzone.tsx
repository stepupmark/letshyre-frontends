import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { FileUp, RotateCw, X } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"

import {
  checkFile,
  formatBytes,
  type FileProblem,
  type FileRules,
} from "@/lib/file-rules"

type State =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "invalid"; problem: FileProblem }
  | { status: "uploading"; file: File; progress: number }
  | { status: "failed"; file: File }
  | { status: "done"; file: File }

export interface FileDropzoneProps {
  label: string
  rules: FileRules
  /** shown under the box, e.g. what the document is */
  description?: string
  /** a form error for this file */
  error?: string
  /** without `upload` the file is only picked here and sent with the form */
  value?: File | null
  onSelect?: (file: File | null) => void
  upload?: (
    file: File,
    options: { onProgress: (fraction: number) => void; signal: AbortSignal }
  ) => Promise<unknown>
  onUploaded?: (result: unknown, file: File) => void
  onRemove?: () => void
}

/**
 * Validates before sending, shows progress, keeps the file for a retry when the
 * upload fails. Without `upload`, picks a file for the form to send, with a
 * preview for images.
 */
export function FileDropzone({
  label,
  rules,
  description,
  error,
  value,
  onSelect,
  upload,
  onUploaded,
  onRemove,
}: FileDropzoneProps) {
  const { t } = useTranslation("common")
  const locale = useLocale()
  const id = useId()
  const controller = useRef<AbortController | null>(null)
  const [state, setState] = useState<State>(
    value ? { status: "selected", file: value } : { status: "idle" }
  )
  const [dragging, setDragging] = useState(false)

  useEffect(() => () => controller.current?.abort(), [])

  const types = rules.accept.join(", ").toUpperCase().replaceAll(".", "")
  const max = formatBytes(rules.maxBytes, locale)

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
      console.error(error)
      setState({ status: "failed", file })
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

  if (state.status !== "idle" && state.status !== "invalid") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
        <p className="font-medium">{label}</p>
        <div className="flex items-center gap-3">
          {state.status === "selected" &&
          state.file.type.startsWith("image/") ? (
            <ImagePreview file={state.file} />
          ) : (
            <FileUp className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate font-medium">
            {state.file.name}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {formatBytes(state.file.size, locale)}
          </span>
          {state.status !== "uploading" && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("upload.remove", { name: state.file.name })}
              onClick={() => {
                setState({ status: "idle" })
                onSelect?.(null)
                onRemove?.()
              }}
            >
              <X />
            </Button>
          )}
        </div>
        {state.status === "uploading" && (
          <Progress
            value={Math.round(state.progress * 100)}
            aria-label={t("upload.uploading", { name: state.file.name })}
          />
        )}
        {state.status === "done" && (
          <p className="text-success">{t("upload.done")}</p>
        )}
        {state.status === "failed" && (
          <div role="alert" className="flex items-center justify-between gap-3">
            <p className="text-danger">{t("upload.failed")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void start(state.file)}
            >
              <RotateCw />
              {t("upload.retry")}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        ref={zone}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm transition-colors hover:bg-muted/50 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
          dragging && "border-ring bg-muted/50"
        )}
      >
        <FileUp className="size-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {t("upload.drop")}{" "}
          <span className="text-foreground underline underline-offset-4">
            {t("upload.browse")}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {description ? `${description} · ` : ""}
          {t("upload.hint", { types, size: max })}
        </span>
        <input
          id={id}
          type="file"
          accept={rules.accept.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) void start(file)
          }}
        />
      </label>
      {error && state.status !== "invalid" && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {state.status === "invalid" && (
        <p role="alert" className="text-sm text-danger">
          {state.problem.kind === "wrongType"
            ? t("upload.wrongType", { types })
            : t("upload.tooLarge", {
                size: formatBytes(state.problem.size, locale),
                max,
              })}
        </p>
      )}
    </div>
  )
}

function ImagePreview({ file }: { file: File }) {
  // a ref with cleanup, so the object URL lives exactly as long as the img
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
      }
    },
    [file]
  )
  return (
    <img
      ref={attach}
      alt=""
      className="size-10 shrink-0 rounded-md border object-cover"
    />
  )
}
