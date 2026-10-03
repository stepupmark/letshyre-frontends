import { useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"

import { ContactChannels } from "./components/contact-channels"
import { ContactForm } from "./components/contact-form"
import { plainText } from "./lib/plain-text"

export function ContactPage() {
  const { t } = useTranslation("contact")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={plainText(t("info.title"))}
        description={t("info.description")}
      />
      <Container className="grid gap-16 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-24">
        <ContactForm />
        <ContactChannels />
      </Container>
    </>
  )
}
