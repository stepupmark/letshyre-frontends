import { Trans, useTranslation } from "@workspace/i18n/react"
import { MailIcon } from "lucide-react"
import { useId, useState } from "react"

import { HIGHLIGHT } from "@/components/highlight"
import { Container } from "@/components/section"
import { SITE } from "@/lib/seo/site"

import { useContactReason } from "../hooks/use-contact-reason"
import { ContactForm } from "./contact-form"
import { NextSteps } from "./next-steps"

export function ContactHero() {
  const { t } = useTranslation("contact")
  const titleId = useId()
  const reason = useContactReason()
  const [sent, setSent] = useState(false)

  return (
    <section aria-labelledby={titleId} className="overflow-hidden border-b">
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:gap-x-16 lg:gap-y-12">
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <p className="text-sm font-semibold text-primary">
            {t("meta.crumb")}
          </p>
          <h1
            id={titleId}
            className="max-w-lg text-4xl/[1.1] font-semibold tracking-tight text-balance sm:text-5xl/[1.05]"
          >
            <Trans t={t} i18nKey="info.title" components={HIGHLIGHT} />
          </h1>
          <p className="max-w-md text-lg/7 text-pretty text-muted-foreground">
            {t("info.description")}
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="rise overflow-hidden rounded-2xl border bg-card shadow-[0_24px_64px_-24px_rgb(15_23_42/0.25)]">
            <div className="flex h-12 items-center gap-3 border-b px-5 sm:px-6">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              </span>
              <p className="text-sm font-medium">{t("form.title")}</p>
              <p className="ms-auto flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <MailIcon aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{SITE.email}</span>
              </p>
            </div>
            <ContactForm
              reason={reason}
              presetSubject={reason ? t("form.topics.sales") : undefined}
              onSentChange={setSent}
            />
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
          <NextSteps sent={sent} />
        </div>
      </Container>
    </section>
  )
}
