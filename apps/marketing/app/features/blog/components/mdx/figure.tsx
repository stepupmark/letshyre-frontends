import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Maximize2Icon } from "lucide-react"
import { useState } from "react"

import { FigureZoom } from "./figure-zoom"
import { Image, type ImageSource } from "./image"

export function Figure({
  src,
  srcDark,
  alt,
  width,
  height,
  caption,
  wide = false,
}: {
  src: ImageSource
  /** Drawn for the dark theme; it follows the site's theme, not the OS setting. */
  srcDark?: ImageSource
  alt: string
  width: number
  height: number
  caption?: string
  /** Runs past the text column on large screens. */
  wide?: boolean
}) {
  const { t } = useTranslation("blog")
  const [zoomed, setZoomed] = useState(false)
  const sizes = wide
    ? "(min-width: 1024px) 52rem, 100vw"
    : "(min-width: 768px) 40rem, 100vw"

  return (
    <figure data-wide={wide || undefined} className="my-4 flex flex-col gap-3">
      <div className="group relative">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- a pointer shortcut; the button below is the keyboard way in */}
        <div
          onClick={() => {
            setZoomed(true)
          }}
          className="cursor-zoom-in print:cursor-auto"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={cn(
              "rounded-xl border bg-card",
              srcDark && "dark:hidden"
            )}
          />
          {srcDark && (
            <Image
              src={srcDark}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              className="hidden rounded-xl border bg-card dark:block"
            />
          )}
        </div>
        <button
          type="button"
          aria-label={t("mdx.zoom")}
          onClick={() => {
            setZoomed(true)
          }}
          className="absolute inset-e-2 top-2 grid size-9 place-items-center rounded-lg border bg-background/90 text-muted-foreground transition-opacity duration-200 outline-none hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100 print:hidden"
        >
          <Maximize2Icon aria-hidden className="size-4" />
        </button>
      </div>
      {caption && (
        <figcaption className="text-sm text-pretty text-muted-foreground">
          {caption}
        </figcaption>
      )}
      {zoomed && (
        <FigureZoom
          src={src}
          srcDark={srcDark}
          alt={alt}
          width={width}
          height={height}
          caption={caption}
          onClose={() => {
            setZoomed(false)
          }}
        />
      )}
    </figure>
  )
}
