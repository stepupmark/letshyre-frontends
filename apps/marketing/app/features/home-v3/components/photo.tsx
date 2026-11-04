import { cn } from "@workspace/ui/lib/utils"

const SETS = {
  "home-v2": [720, 1440],
  "home-v3": [960, 1920],
} as const

export type PhotoName = `${keyof typeof SETS}/${string}`

/** A 3:2 photo from public/images, encoded in AVIF and WebP at the set's two widths. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  className,
}: {
  name: PhotoName
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  const [set] = name.split("/") as [keyof typeof SETS]
  const [small, large] = SETS[set]
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
        height={(large * 2) / 3}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover"
      />
    </picture>
  )
}
