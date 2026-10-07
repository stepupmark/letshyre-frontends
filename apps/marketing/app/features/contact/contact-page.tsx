import { Trans, useTranslation } from "@workspace/i18n/react"

import { HIGHLIGHT } from "@/components/highlight"
import { Container, PageHeader } from "@/components/section"

import { ContactChannels } from "./components/contact-channels"
import { ContactForm } from "./components/contact-form"

export function ContactPage() {
  const { t } = useTranslation("contact")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={<Trans t={t} i18nKey="info.title" components={HIGHLIGHT} />}
        description={t("info.description")}
      />
      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <ContactForm />
        <ContactChannels />
      </Container>
    </>
  )
}
