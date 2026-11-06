import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { Check, FileUp, RotateCw, X, type LucideIcon } from "lucide-react"
import { useId } from "react"

import { UPLOAD_FAILED, useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes, type FileRules } from "@/lib/file-rules"

import { FileImage } from "./file-image"

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
  /** "row" is a compact line for stacking several in one list */
  layout?: "box" | "row"
  icon?: LucideIcon
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
  layout = "box",
  icon: Icon = FileUp,
}: FileDropzoneProps) {
  const { t } = useTranslation("common")
  const locale = useLocale()
  const id = useId()
  const { state, dragging, zone, start, remove } = useFileUpload({
    rules,
    value,
    onSelect,
    upload,
    onUploaded,
    onRemove,
  })

  const types = rules.accept.join(", ").toUpperCase().replaceAll(".", "")
  const max = formatBytes(rules.maxBytes, locale)
  const problem =
    state.status === "invalid"
      ? state.problem.kind === "wrongType"
        ? t("upload.wrongType", { types })
        : t("upload.tooLarge", {
            size: formatBytes(state.problem.size, locale),
            max,
          })
      : error

  if (layout === "row") {
    if (state.status !== "idle" && state.status !== "invalid") {
      const { file } = state
      return (
        <div className="flex flex-col gap-2 px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {file.type.startsWith("image/") ? (
                <FileImage
                  file={file}
                  className="size-10 shrink-0 rounded-md border object-cover"
                />
              ) : (
                <span className="grid size-10 place-items-center rounded-lg bg-brand-muted text-brand-text">
                  <Icon className="size-4.5" />
                </span>
              )}
              {state.status !== "uploading" && state.status !== "failed" && (
                <span className="pop absolute -inset-e-1 -bottom-1 grid size-4.5 place-items-center rounded-full bg-success text-background ring-2 ring-background">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-sm font-medium">{label}</p>
              <p className="flex min-w-0 gap-1.5 text-xs text-muted-foreground">
                <span className="truncate">{file.name}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 tabular-nums">
                  {formatBytes(file.size, locale)}
                </span>
              </p>
            </div>
            {state.status !== "uploading" && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("upload.remove", { name: file.name })}
                onClick={remove}
              >
                <X />
              </Button>
            )}
          </div>
          {state.status === "uploading" && (
            <Progress
              value={Math.round(state.progress * 100)}
              aria-label={t("upload.uploading", { name: file.name })}
            />
          )}
          {state.status === "failed" && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 text-sm"
            >
              <p className="text-danger">{t(UPLOAD_FAILED[state.reason])}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void start(file)}
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
      <div>
        <label
          htmlFor={id}
          ref={zone}
          className={cn(
            "group flex cursor-pointer items-center gap-3.5 px-4 py-3.5 transition-colors outline-none hover:bg-muted/40 has-focus-visible:bg-muted/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-focus-visible:ring-inset",
            dragging && "bg-brand-muted/50"
          )}
        >
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-lg border border-dashed text-muted-foreground transition-colors",
              dragging && "border-brand text-brand-text"
            )}
          >
            <Icon className="size-4.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">
              {description ? `${description} · ` : ""}
              {t("upload.hint", { types, size: max })}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="inline-flex h-8 shrink-0 items-center rounded-lg border bg-background px-3 text-sm font-medium shadow-xs transition-colors group-hover:bg-muted"
          >
            {t("upload.choose")}
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
        {problem && (
          <p role="alert" className="ps-17.5 pe-4 pb-3.5 text-sm text-danger">
            {problem}
          </p>
        )}
      </div>
    )
  }

  if (state.status !== "idle" && state.status !== "invalid") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
        <p className="font-medium">{label}</p>
        <div className="flex items-center gap-3">
          {state.status === "selected" &&
          state.file.type.startsWith("image/") ? (
            <FileImage
              file={state.file}
              className="size-10 shrink-0 rounded-md border object-cover"
            />
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
              onClick={remove}
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
            <p className="text-danger">{t(UPLOAD_FAILED[state.reason])}</p>
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
      {problem && (
        <p role="alert" className="text-sm text-danger">
          {problem}
        </p>
      )}
    </div>
  )
}
