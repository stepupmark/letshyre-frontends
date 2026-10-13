import { clearConsent } from "@workspace/analytics"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { MailIcon } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { analyticsEnabled } from "@/lib/analytics"
import { PAGES } from "@/lib/pages"
import { SITE } from "@/lib/seo/site"

import { LEGAL_DOCS, type LegalNamespace } from "../lib/legal-doc"

/** Cookie settings, the support box and links to the other documents. */
export function LegalFooter({ ns }: { ns: LegalNamespace }) {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const relatedId = useId()
  const others = (Object.keys(LEGAL_DOCS) as LegalNamespace[]).filter(
    (other) => other !== ns
  )

  return (
    <div className="flex flex-col gap-8 print:hidden">
      {ns === "legalPolicy" && analyticsEnabled && (
        <Button variant="outline" className="w-fit" onClick={clearConsent}>
          {t("legal.manageCookies")}
        </Button>
      )}

      <aside className="flex flex-col gap-4 rounded-2xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {t("support.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("support.body")}</p>
          <a
            href={`mailto:${SITE.email}`}
            className="more-link mt-1 inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <MailIcon aria-hidden className="size-4" />
            {SITE.email}
          </a>
        </div>
        <Link
          to={localePath(lang, PAGES.contact.path)}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("support.contact")}
        </Link>
      </aside>

      <nav aria-labelledby={relatedId} className="flex flex-col gap-2">
        <h2 id={relatedId} className="text-sm font-semibold text-foreground">
          {t("legal.related")}
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {others.map((other) => (
            <li key={other}>
              <Link
                to={localePath(lang, LEGAL_DOCS[other].path)}
                className="more-link"
              >
                {t(LEGAL_DOCS[other].label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
