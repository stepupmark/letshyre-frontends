import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import { Image, type ImageSource } from "./image"

/**
 * The figure full screen, at least 720px wide so a diagram's labels stay readable on a phone,
 * scrolling sideways where the screen is narrower. A native dialog, so focus, Esc and the
 * backdrop come from the browser.
 */
export default function FigureZoom({
  src,
  srcDark,
  alt,
  width,
  height,
  caption,
  onClose,
}: {
  src: ImageSource
  srcDark?: ImageSource
  alt: string
  width: number
  height: number
  caption?: string
  onClose: () => void
}) {
  const { t } = useTranslation("blog")
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a click on the backdrop closes it; Esc already does natively
    <dialog
      ref={dialog}
      aria-label={alt}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close()
      }}
      className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden rounded-xl border bg-background p-0 text-foreground backdrop:bg-foreground/60 open:flex"
    >
      <div className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <p className="truncate text-sm text-muted-foreground">{caption}</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("mdx.close")}
          onClick={() => dialog.current?.close()}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the dialog opens on a click, so focus starts on its only control
          autoFocus
        >
          <XIcon aria-hidden />
        </Button>
      </div>
      <div className="overflow-auto p-4">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          className={srcDark ? "min-w-180 dark:hidden" : "min-w-180"}
        />
        {srcDark && (
          <Image
            src={srcDark}
            alt={alt}
            width={width}
            height={height}
            sizes="100vw"
            className="hidden min-w-180 dark:block"
          />
        )}
      </div>
    </dialog>
  )
}
