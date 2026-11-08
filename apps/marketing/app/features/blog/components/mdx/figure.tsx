export function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string
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
        className="h-auto w-full rounded-xl border bg-card"
      />
      {caption && (
        <figcaption className="text-sm text-pretty text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
