import { Trans, useTranslation } from "@workspace/i18n/react"
import { PlusIcon } from "lucide-react"

import { useGuideLinks } from "../hooks/use-guide-links"
import { FAQ_ANCHOR, FAQ_IDS } from "../lib/chapters"

export function GuideFaq() {
  const { t } = useTranslation("employerGuide")
  const links = useGuideLinks()

  return (
    <section
      id={FAQ_ANCHOR}
      aria-labelledby={`${FAQ_ANCHOR}-title`}
      className="scroll-mt-24 border-t pt-12"
    >
      <h2
        id={`${FAQ_ANCHOR}-title`}
        className="text-2xl font-semibold tracking-tight text-balance text-brand-text sm:text-3xl"
      >
        {t("faq.title")}
      </h2>
      <ul className="mt-6 flex flex-col divide-y border-y">
        {FAQ_IDS.map((id) => (
          <li key={id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 rounded-md py-4 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span className="flex-1 text-pretty">
                  {t(`faq.items.${id}.q`)}
                </span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                  <PlusIcon
                    aria-hidden
                    className="size-4 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  />
                </span>
              </summary>
              <p className="max-w-2xl pe-11 pb-5 text-pretty text-muted-foreground">
                <Trans t={t} i18nKey={`faq.items.${id}.a`} components={links} />
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
