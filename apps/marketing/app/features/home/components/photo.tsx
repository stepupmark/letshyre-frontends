import { cn } from "@workspace/ui/lib/utils"

const WIDTHS = [960, 1200] as const
const PORTRAIT_WIDTHS = [600, 960] as const

export type PhotoName = `home/${string}`

/** A photo from public/images in AVIF and WebP at two widths; portraits are the narrower set. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  lazy,
  portrait,
  className,
}: {
  name: PhotoName
  alt: string
  sizes: string
  priority?: boolean
  /** Keeps a priority photo lazy, so a screen that hides it never fetches it. */
  lazy?: boolean
  portrait?: boolean
  className?: string
}) {
  const [small, large] = portrait ? PORTRAIT_WIDTHS : WIDTHS
  const srcSet = (type: "avif" | "webp") =>
    `/images/${name}-${small}.${type} ${small}w, /images/${name}-${large}.${type} ${large}w`

  return (
    <picture className={cn("block overflow-hidden bg-muted", className)}>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img
        src={`/images/${name}-${large}.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt={alt}
        width={large}
        height={portrait ? (large * 5) / 4 : (large * 2) / 3}
        loading={priority && !lazy ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover"
      />
    </picture>
  )
}
