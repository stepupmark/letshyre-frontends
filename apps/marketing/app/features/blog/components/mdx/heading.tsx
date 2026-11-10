import { useTranslation } from "@workspace/i18n/react"
import { HashIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { toast } from "sonner"

import { useCopy } from "@/hooks/use-copy"

import { InlineCta } from "../inline-cta"

/** An h2 with a link to itself beside it, outside the heading so its name stays the text. */
export function SectionHeading({
  id,
  children,
  ...props
}: ComponentProps<"h2">) {
  const { t } = useTranslation("blog")
  const { canCopy, copy } = useCopy()

  return (
    <>
      <InlineCta before={id} />
      <div className="group mt-8 flex items-baseline gap-2 print:break-after-avoid">
        <h2
          id={id}
          className="text-2xl font-semibold tracking-tight text-balance text-foreground lg:text-3xl"
          {...props}
        >
          {children}
        </h2>
        {id && (
          <a
            href={`#${id}`}
            aria-label={t("post.sectionLink")}
            onClick={(event) => {
              if (!canCopy) return
              void copy(new URL(event.currentTarget.href).href).then((done) => {
                if (done) toast.success(t("post.sectionCopied"))
              })
            }}
            className="rounded-sm text-muted-foreground opacity-0 transition-opacity duration-200 outline-none group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none print:hidden"
          >
            <HashIcon aria-hidden className="size-5" />
          </a>
        )}
      </div>
    </>
  )
}
