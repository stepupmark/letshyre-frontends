import { cn } from "@workspace/ui/lib/utils"

export function Figure({
  src,
  srcDark,
  alt,
  width,
  height,
  caption,
}: {
  src: string
  /** Drawn for the dark theme; it follows the site's theme, not the OS setting. */
  srcDark?: string
  alt: string
  width: number
  height: number
  caption?: string
}) {
  return (
    <figure className="my-4 flex flex-col gap-3">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-auto w-full rounded-xl border bg-card",
          srcDark && "dark:hidden"
        )}
      />
      {srcDark && (
        <img
          src={srcDark}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="hidden h-auto w-full rounded-xl border bg-card dark:block"
        />
      )}
      {caption && (
        <figcaption className="text-sm text-pretty text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
