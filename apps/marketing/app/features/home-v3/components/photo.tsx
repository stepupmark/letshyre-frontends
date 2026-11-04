import { cn } from "@workspace/ui/lib/utils"

const SETS = {
  "home-v2": [720, 1440],
  "home-v3": [960, 1920],
} as const

// portraits are 4:5 at 720 and 1440 in every set
const PORTRAIT = [720, 1440] as const

export type PhotoName = `${keyof typeof SETS}/${string}`

/** A photo from public/images in AVIF and WebP: 3:2 at the set's two widths, or 4:5 portrait. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  portrait,
  className,
}: {
  name: PhotoName
  alt: string
  sizes: string
  priority?: boolean
  portrait?: boolean
  className?: string
}) {
  const [set] = name.split("/") as [keyof typeof SETS]
  const [small, large] = portrait ? PORTRAIT : SETS[set]
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
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover"
      />
    </picture>
  )
}
