import { cn } from "@workspace/ui/lib/utils"

import { type PhotoName, photoSize, photoSrcSet } from "../lib/photos"

/** A photo from public/images in AVIF and WebP at two widths. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  lazy,
  className,
}: {
  name: PhotoName
  alt: string
  sizes: string
  priority?: boolean
  /** Keeps a priority photo lazy, so a screen that hides it never fetches it. */
  lazy?: boolean
  className?: string
}) {
  const { width, height } = photoSize(name)

  return (
    <picture className={cn("block overflow-hidden bg-muted", className)}>
      <source
        type="image/avif"
        srcSet={photoSrcSet(name, "avif")}
        sizes={sizes}
      />
      <img
        src={`/images/${name}-${width}.webp`}
        srcSet={photoSrcSet(name, "webp")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority && !lazy ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover"
      />
    </picture>
  )
}
