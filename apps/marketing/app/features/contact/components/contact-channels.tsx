import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  CopyIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { Section } from "@/components/section"
import { useCopy } from "@/hooks/use-copy"
import { usePagePath } from "@/hooks/use-page-path"
import { SITE } from "@/lib/seo/site"

const LINKS = [
  { id: "employers", icon: BriefcaseIcon, page: "pricing" },
  { id: "candidates", icon: GraduationCapIcon, page: "interview" },
] as const

function CopyEmail() {
  const { t } = useTranslation("contact")
  const { canCopy, copied, copy } = useCopy()
  if (!canCopy) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("channels.email.copy")}
        onClick={() => {
          void copy(SITE.email)
        }}
      >
        {copied ? (
          <CheckIcon aria-hidden className="pop text-brand-text" />
        ) : (
          <CopyIcon aria-hidden />
        )}
      </Button>
      <span role="status" className="sr-only">
        {copied ? t("channels.email.copied") : ""}
      </span>
    </>
  )
}

function ChannelIcon({ icon: Icon }: { icon: typeof MailIcon }) {
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-brand-muted text-brand-text transition-transform duration-300 group-hover/channel:-translate-y-0.5 motion-reduce:transition-none">
      <Icon aria-hidden className="size-5" />
    </span>
  )
}

export function ContactChannels() {
  const { t } = useTranslation("contact")
  const pagePath = usePagePath()
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="py-10 sm:py-14">
      <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
        {t("channels.title")}
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        <li className="group/channel flex flex-col gap-4 rounded-2xl border p-5 transition-colors duration-300 hover:border-brand/40">
          <div className="flex items-start justify-between gap-2">
            <ChannelIcon icon={MailIcon} />
            <CopyEmail />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold tracking-tight">
              {t("channels.email.title")}
            </h3>
            <a
              href={`mailto:${SITE.email}`}
              className="more-link w-fit text-sm"
            >
              {SITE.email}
            </a>
          </div>
        </li>
        {LINKS.map(({ id, icon, page }) => (
          <li key={id}>
            <Link
              to={pagePath(page)}
              className="group/channel flex h-full flex-col gap-4 rounded-2xl border p-5 transition-colors duration-300 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChannelIcon icon={icon} />
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold tracking-tight">
                  {t(`channels.${id}.title`)}
                </h3>
                <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t(`channels.${id}.link`)}
                  <ArrowRightIcon
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover/channel:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover/channel:-translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
