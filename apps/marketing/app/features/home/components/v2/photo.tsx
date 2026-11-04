import { cn } from "@workspace/ui/lib/utils"

/** A photo from public/images/home-v2, encoded at 720 and 1440 px wide in AVIF and WebP, 3:2 or 4:5. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  portrait,
  className,
}: {
  name: string
  alt: string
  sizes: string
  priority?: boolean
  portrait?: boolean
  className?: string
}) {
  const srcSet = (type: "avif" | "webp") =>
    `/images/home-v2/${name}-720.${type} 720w, /images/home-v2/${name}-1440.${type} 1440w`

  return (
    <picture
      className={cn(
        "block overflow-hidden rounded-2xl border bg-muted",
        portrait ? "aspect-4/5" : "aspect-3/2",
        className
      )}
    >
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img
        src={`/images/home-v2/${name}-1440.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt={alt}
        width={1440}
        height={portrait ? 1800 : 960}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover"
      />
    </picture>
  )
}
