import { safeUrl } from "@workspace/api"
import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink as ExternalLinkIcon,
  FileText,
  FileX,
  Maximize2,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { Preview } from "./document-preview"

export interface ViewerDocument {
  label: string
  url: string | null | undefined
}

interface DocumentViewerProps {
  documents: ViewerDocument[]
  index: number
  onIndexChange: (index: number) => void
  onExpand?: () => void
  className?: string
}

export function DocumentViewer({
  documents,
  index,
  onIndexChange,
  onExpand,
  className,
}: DocumentViewerProps) {
  const current = documents[index]
  const url = safeUrl(current?.url)
  const last = documents.length - 1

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-1 border-b p-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous document"
          disabled={index <= 0}
          onClick={() => {
            onIndexChange(index - 1)
          }}
        >
          <ChevronLeft />
        </Button>
        <Select
          value={String(index)}
          items={documents.map((doc, position) => ({
            value: String(position),
            label: doc.label,
          }))}
          onValueChange={(value) => {
            onIndexChange(Number(value))
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="Document"
            className="min-w-0 flex-1 border-none shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {documents.map((doc, position) => (
              <SelectItem key={doc.label} value={String(position)}>
                {doc.label}
                {!safeUrl(doc.url) && (
                  <span className="text-muted-foreground">· missing</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="px-1 text-xs text-muted-foreground tabular-nums">
          {index + 1} / {documents.length}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next document"
          disabled={index >= last}
          onClick={() => {
            onIndexChange(index + 1)
          }}
        >
          <ChevronRight />
        </Button>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in new tab"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" })
            )}
          >
            <ExternalLinkIcon />
          </a>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open in new tab"
            disabled
          >
            <ExternalLinkIcon />
          </Button>
        )}
        {onExpand && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Full screen"
            onClick={onExpand}
          >
            <Maximize2 />
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {url ? (
          <Preview key={url} url={url} label={current?.label ?? "Document"} />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileX className="size-8" />
            {current?.url
              ? "The link to this file is invalid."
              : "Not uploaded yet."}
          </div>
        )}
      </div>
    </div>
  )
}

interface DocumentViewerDialogProps {
  documents: ViewerDocument[]
  index: number | null
  onIndexChange: (index: number | null) => void
}

export function DocumentViewerDialog({
  documents,
  index,
  onIndexChange,
}: DocumentViewerDialogProps) {
  const open = index !== null

  useEffect(() => {
    if (index === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[role=listbox]")
      )
        return
      if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1)
      if (event.key === "ArrowRight" && index < documents.length - 1)
        onIndexChange(index + 1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [index, documents.length, onIndexChange])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onIndexChange(null)
      }}
    >
      <DialogContent className="flex h-[90svh] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-6xl">
        <DialogTitle className="sr-only">Documents</DialogTitle>
        <DialogDescription className="sr-only">
          Use the arrow keys to move between documents.
        </DialogDescription>
        {index !== null && (
          <DocumentViewer
            documents={documents}
            index={index}
            onIndexChange={onIndexChange}
            className="min-h-0 flex-1 rounded-none border-0 [&>div:first-child]:pe-12"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DocumentListProps {
  documents: ViewerDocument[]
  className?: string
}

export function DocumentList({ documents, className }: DocumentListProps) {
  const [viewing, setViewing] = useState<number | null>(null)

  return (
    <>
      <div className={cn("grid gap-2", className)}>
        {documents.map((doc, index) => (
          <div
            key={doc.label}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm">
              <FileText className="size-4 text-muted-foreground" />
              {doc.label}
            </span>
            {safeUrl(doc.url) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewing(index)
                }}
              >
                View
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                {doc.url ? "Invalid link" : "Not uploaded"}
              </span>
            )}
          </div>
        ))}
      </div>
      <DocumentViewerDialog
        documents={documents}
        index={viewing}
        onIndexChange={setViewing}
      />
    </>
  )
}
