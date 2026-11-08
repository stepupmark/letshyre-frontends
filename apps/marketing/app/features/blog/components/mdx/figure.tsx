import { cn } from "@workspace/ui/lib/utils"

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
  const sizes = wide
    ? "(min-width: 1024px) 52rem, 100vw"
    : "(min-width: 768px) 40rem, 100vw"

  return (
    <figure data-wide={wide || undefined} className="my-4 flex flex-col gap-3">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn("rounded-xl border bg-card", srcDark && "dark:hidden")}
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
      {caption && (
        <figcaption className="text-sm text-pretty text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
