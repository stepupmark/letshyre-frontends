import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { CheckIcon, LinkIcon } from "lucide-react"

import { useCopy } from "@/hooks/use-copy"

import { type LegalDoc, splitNumber } from "../lib/legal-doc"
import { LegalBlocks } from "./legal-blocks"

type Section = LegalDoc["sections"][number]

function CopyLink({ id, title }: { id: string; title: string }) {
  const { t } = useTranslation("common")
  const { canCopy, copied, copy } = useCopy()
  if (!canCopy) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("legal.copyLink", { title })}
        data-copied={copied || undefined}
        onClick={() => {
          copy(`${location.origin}${location.pathname}#${id}`)
        }}
        className="mt-0.5 shrink-0 text-muted-foreground opacity-0 group-hover/heading:opacity-100 focus-visible:opacity-100 data-copied:opacity-100 print:hidden pointer-coarse:opacity-100"
      >
        {copied ? (
          <CheckIcon aria-hidden className="pop text-brand-text" />
        ) : (
          <LinkIcon aria-hidden />
        )}
      </Button>
      <span role="status" className="sr-only">
        {copied ? t("legal.linkCopied") : ""}
      </span>
    </>
  )
}

export function LegalSection({ section }: { section: Section }) {
  const { number, rest } = splitNumber(section.title)

  return (
    <section
      aria-labelledby={section.id}
      className="flex flex-col gap-3 print:break-inside-avoid-page"
    >
      <div className="group/heading slide-in mb-1 flex items-start gap-3">
        {number && (
          <span
            aria-hidden
            className="mt-px grid h-7 min-w-7 shrink-0 place-items-center rounded-md bg-muted px-1.5 text-sm font-semibold text-foreground/75 tabular-nums sm:mt-0.5"
          >
            {number}
          </span>
        )}
        <h2
          id={section.id}
          className="target:flash -mx-1.5 flex-1 scroll-mt-10 rounded-md px-1.5 text-xl/tight font-semibold tracking-tight text-foreground sm:text-2xl/tight lg:scroll-mt-0"
        >
          {number && <span className="sr-only">{number}. </span>}
          {rest}
        </h2>
        <CopyLink id={section.id} title={rest} />
      </div>
      <LegalBlocks sectionId={section.id} blocks={section.blocks} />
    </section>
  )
}
