import { cn } from "@workspace/ui/lib/utils"

/** A photo from public/images/home-v2, encoded at 720 and 1440 px wide in AVIF and WebP. */
export function Photo({
  name,
  alt,
  sizes,
  priority,
  className,
}: {
  name: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  const srcSet = (type: "avif" | "webp") =>
    `/images/home-v2/${name}-720.${type} 720w, /images/home-v2/${name}-1440.${type} 1440w`

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img
        src={`/images/home-v2/${name}-1440.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt={alt}
        width={1440}
        height={960}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={cn(
          "aspect-3/2 h-auto w-full rounded-3xl border bg-muted object-cover",
          className
        )}
      />
    </picture>
  )
}
