import { useTranslation } from "@workspace/i18n/react"
import { PlayIcon } from "lucide-react"
import { useState } from "react"

import { Image, type ImageSource } from "./image"

/**
 * A poster that links to YouTube, swapped for the player on click, so nothing loads from
 * YouTube until the reader asks. postbuild allows the frame on pages marked data-video-embed.
 */
export function VideoEmbed({
  id,
  title,
  poster,
}: {
  id: string
  title: string
  poster: ImageSource
}) {
  const { t } = useTranslation("blog")
  const [playing, setPlaying] = useState(false)

  return (
    <div
      data-video-embed
      data-wide
      className="my-4 aspect-video overflow-hidden rounded-xl border bg-muted"
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          aria-label={t("mdx.play", { title })}
          onClick={(event) => {
            event.preventDefault()
            setPlaying(true)
          }}
          className="group relative grid size-full place-items-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src={poster}
            alt=""
            width={1280}
            height={720}
            sizes="(min-width: 1024px) 52rem, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
          <span className="relative grid size-16 place-items-center rounded-full bg-background/90 text-foreground transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
            <PlayIcon aria-hidden className="size-7 translate-x-0.5" />
          </span>
        </a>
      )}
    </div>
  )
}
