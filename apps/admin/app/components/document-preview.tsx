import { useState } from "react"
import { FileX, RotateCw, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button, buttonVariants } from "@workspace/ui/components/button"

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

function kindOf(url: string) {
  const path = new URL(url).pathname.toLowerCase()
  if (path.endsWith(".pdf")) return "pdf"
  if (/\.(png|jpe?g|webp|gif|avif|bmp)$/.test(path)) return "image"
  return "unknown"
}

export function Preview({ url, label }: { url: string; label: string }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [failed, setFailed] = useState(false)
  const kind = kindOf(url)
  const zoomIndex = ZOOM_STEPS.indexOf(zoom)

  if (kind === "pdf")
    return (
      <iframe
        src={url}
        title={label}
        className="size-full bg-muted"
        referrerPolicy="no-referrer"
      />
    )

  if (failed)
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        <FileX className="size-8" />
        This file can&apos;t be previewed here.
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open in new tab
        </a>
      </div>
    )

  return (
    <div className="relative size-full">
      <div className="size-full overflow-auto bg-muted/40">
        <div
          className={cn(
            "flex min-h-full p-4",
            zoom <= 1 && "items-center justify-center"
          )}
        >
          <img
            src={url}
            alt={label}
            referrerPolicy="no-referrer"
            onError={() => {
              setFailed(true)
            }}
            className="max-w-none object-contain transition-transform"
            style={{
              width: zoom <= 1 ? undefined : `${zoom * 100}%`,
              maxWidth: zoom <= 1 ? `${zoom * 100}%` : undefined,
              maxHeight: zoom <= 1 ? "100%" : undefined,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>
      <div className="absolute inset-s-1/2 bottom-3 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          disabled={zoomIndex <= 0}
          onClick={() => {
            setZoom(ZOOM_STEPS[zoomIndex - 1] ?? zoom)
          }}
        >
          <ZoomOut />
        </Button>
        <button
          type="button"
          className="w-12 text-center text-xs tabular-nums"
          onClick={() => {
            setZoom(1)
            setRotation(0)
          }}
          aria-label="Reset zoom and rotation"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          disabled={zoomIndex >= ZOOM_STEPS.length - 1}
          onClick={() => {
            setZoom(ZOOM_STEPS[zoomIndex + 1] ?? zoom)
          }}
        >
          <ZoomIn />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Rotate"
          onClick={() => {
            setRotation((value) => (value + 90) % 360)
          }}
        >
          <RotateCw />
        </Button>
      </div>
    </div>
  )
}
