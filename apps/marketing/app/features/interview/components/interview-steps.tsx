import { localePath } from "@workspace/i18n"
import {
  Trans,
  useFormat,
  useLocale,
  useTranslation,
} from "@workspace/i18n/react"
import { Item, ItemContent } from "@workspace/ui/components/item"
import { Link } from "react-router"

import { STEPS, stepAnchor, tipFor } from "../lib/sections"

export function InterviewSteps() {
  const { t } = useTranslation("interview")
  const lang = useLocale()
  const format = useFormat()

  return (
    <ol className="flex flex-col">
      {STEPS.map((id, index) => {
        const tip = tipFor(id)
        const anchor = stepAnchor(id)

        return (
          <li key={id} id={anchor} className="flex scroll-mt-24 gap-4 sm:gap-6">
            <div aria-hidden className="flex flex-col items-center">
              <span className="flex shrink-0 items-center justify-center rounded-full border bg-background text-sm font-medium tabular-nums block-9 inline-9">
                {format.number(index + 1)}
              </span>
              {index < STEPS.length - 1 && (
                <span className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-3 pt-1.5 pb-12">
              <h2
                id={`${anchor}-title`}
                className="text-xl font-semibold tracking-tight"
              >
                {t(`steps.${id}.title`)}
              </h2>
              <p className="max-w-2xl text-pretty text-muted-foreground">
                {id === "download" ? (
                  <Trans
                    t={t}
                    i18nKey="steps.download.desc"
                    components={{
                      dl: (
                        <Link
                          to={localePath(lang, "/download")}
                          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                        />
                      ),
                    }}
                  />
                ) : (
                  t(`steps.${id}.desc`)
                )}
              </p>
              {tip && (
                <Item variant="muted" size="sm" className="max-w-2xl">
                  <ItemContent>
                    <p className="text-sm">{t(tip)}</p>
                  </ItemContent>
                </Item>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
