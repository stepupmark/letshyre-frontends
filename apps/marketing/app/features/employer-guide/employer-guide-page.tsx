import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import type { ReactNode } from "react"
import { Link } from "react-router"

import { CtaBand } from "@/components/cta-band"
import { GuideToc } from "@/components/guide/guide-toc"
import { HIGHLIGHT } from "@/components/highlight"
import { Container, PageHeader } from "@/components/section"
import { useActiveSection } from "@/hooks/use-active-section"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { JourneyMap } from "./components/art/journey-map"
import { Chapter } from "./components/chapter"
import { CreditsExplainer } from "./components/credits-explainer"
import { GuideFaq } from "./components/guide-faq"
import { JdChecklist } from "./components/jd-checklist"
import { KeepReady } from "./components/keep-ready"
import { ProfileContents } from "./components/profile-contents"
import { ScoreExplainer } from "./components/score-explainer"
import {
  ANCHORS,
  CHAPTER_ANCHORS,
  CHAPTERS,
  type ChapterId,
  FAQ_ANCHOR,
  READY_ANCHOR,
} from "./lib/chapters"

const EXTRAS: Partial<Record<ChapterId, () => ReactNode>> = {
  post: JdChecklist,
  pool: ScoreExplainer,
  unlock: CreditsExplainer,
  review: ProfileContents,
}

export function EmployerGuidePage() {
  const { t } = useTranslation("employerGuide")
  const lang = useLocale()
  const active = useActiveSection(ANCHORS)
  const pricing = localePath(lang, PAGES.pricing.path)

  const toc = [
    { items: [{ anchor: READY_ANCHOR, label: t("ready.title") }] },
    {
      title: t("toc.chapters"),
      items: CHAPTERS.map((id) => ({
        anchor: CHAPTER_ANCHORS[id],
        label: t(`chapters.${id}.title`),
      })),
    },
    { items: [{ anchor: FAQ_ANCHOR, label: t("toc.faq") }] },
  ]

  return (
    <div className="reading-font">
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={<Trans t={t} i18nKey="title" components={HIGHLIGHT} />}
        description={t("intro")}
        art={<JourneyMap />}
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={APP_LINKS.employerRegister}
            className={buttonVariants({ size: "lg", className: "h-10 px-4" })}
          >
            {t("register")}
          </a>
          <Link
            to={pricing}
            prefetch="intent"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 px-4",
            })}
          >
            {t("pricing")}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{t("readTime")}</p>
      </PageHeader>
      <KeepReady />
      <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <GuideToc label={t("toc.label")} groups={toc} active={active} />
        <div className="flex min-w-0 flex-col gap-14">
          {CHAPTERS.map((id) => {
            const Extra = EXTRAS[id]
            return (
              <Chapter key={id} id={id}>
                {Extra && <Extra />}
              </Chapter>
            )
          })}
          <GuideFaq />
        </div>
      </Container>
      <CtaBand
        title={t("cta.title")}
        description={t("cta.desc")}
        primary={{ label: t("cta.button"), href: APP_LINKS.employerRegister }}
        secondary={{ label: t("cta.secondary"), to: pricing }}
      />
    </div>
  )
}
