import { cn } from "@workspace/ui/lib/utils"

/** What vite-imagetools gives a post's raster import (vite.config.ts). */
interface Picture {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

export type ImageSource = string | Picture

export function Image({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}: {
  src: ImageSource
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
}) {
  const img = (url: string) => (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn("h-auto w-full", className)}
    />
  )
  if (typeof src === "string") return img(src)

  return (
    <picture className="contents">
      {Object.entries(src.sources).map(([format, srcSet]) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={srcSet}
          sizes={sizes}
        />
      ))}
      {img(src.img.src)}
    </picture>
  )
}
