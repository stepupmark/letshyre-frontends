import { useTranslation } from "@workspace/i18n/react"
import { DownloadIcon } from "lucide-react"

import { fileName } from "../../lib/file-name"

/** A template or worksheet beside the post, imported like an image. */
export function Download({ src, title }: { src: string; title: string }) {
  const { t } = useTranslation("blog")
  const type = /\.(\w+)(?:\?|$)/.exec(src)?.[1]?.toUpperCase() ?? ""

  return (
    <a
      href={src}
      download={fileName(title, type)}
      className="group my-2 flex items-center gap-4 rounded-xl border p-4 text-base transition-colors duration-200 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none print:hidden"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-muted text-brand-text">
        <DownloadIcon aria-hidden className="size-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">
          {t("mdx.download", { type })}
        </span>
      </span>
    </a>
  )
}
