import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CopyIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Link } from "react-router"

import { SocialLinks } from "@/components/social-links"
import { PAGES } from "@/lib/pages"
import { SITE } from "@/lib/seo/site"

function CopyEmail() {
  const { t } = useTranslation("contact")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("channels.email.copy")}
        onClick={() => {
          navigator.clipboard.writeText(SITE.email).then(
            () => {
              setCopied(true)
            },
            () => undefined
          )
        }}
      >
        {copied ? (
          <CheckIcon aria-hidden className="text-brand" />
        ) : (
          <CopyIcon aria-hidden />
        )}
      </Button>
      <span role="status" className="sr-only">
        {copied && t("channels.email.copied")}
      </span>
    </>
  )
}

export function ContactChannels() {
  const { t } = useTranslation("contact")
  const lang = useLocale()
  const titleId = useId()
  const links = [
    {
      id: "employers",
      icon: BriefcaseIcon,
      path: PAGES.pricing.path,
    },
    {
      id: "candidates",
      icon: GraduationCapIcon,
      path: PAGES.interview.path,
    },
  ] as const

  return (
    <aside
      aria-labelledby={titleId}
      className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {t("channels.title")}
      </h2>
      <ItemGroup className="gap-2">
        <Item variant="outline" role="listitem">
          <ItemMedia variant="icon">
            <MailIcon aria-hidden className="text-brand" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("channels.email.title")}</ItemTitle>
            <ItemDescription>
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {SITE.email}
              </a>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <CopyEmail />
          </ItemActions>
        </Item>
        {links.map(({ id, icon: Icon, path }) => (
          <div key={id} role="listitem">
            <Item
              variant="outline"
              render={<Link to={localePath(lang, path)} />}
            >
              <ItemMedia variant="icon">
                <Icon aria-hidden className="text-brand" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{t(`channels.${id}.title`)}</ItemTitle>
                <ItemDescription className="text-primary">
                  {t(`channels.${id}.link`)}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon
                  aria-hidden
                  className="size-4 text-muted-foreground rtl:rotate-180"
                />
              </ItemActions>
            </Item>
          </div>
        ))}
      </ItemGroup>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClockIcon aria-hidden className="size-4 shrink-0 text-brand" />
        {t("channels.replyTime")}
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{t("channels.social")}</p>
        <SocialLinks className="-ms-2" />
      </div>
    </aside>
  )
}
