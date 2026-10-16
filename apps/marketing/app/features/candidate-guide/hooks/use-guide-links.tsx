import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { Link } from "react-router"

import { TextLink } from "@/components/guide/text-link"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { REQUIREMENTS_ANCHOR, RULES_ANCHOR } from "../lib/chapters"

/** `<Trans>` components for the links the guide copy can contain. */
export function useGuideLinks() {
  const lang = useLocale()
  return {
    reg: <TextLink href={APP_LINKS.candidateRegister} />,
    reqs: <TextLink href={`#${REQUIREMENTS_ANCHOR}`} />,
    rules: <TextLink href={`#${RULES_ANCHOR}`} />,
    dl: (
      <Link to={localePath(lang, PAGES.download.path)} className="text-link" />
    ),
    pp: (
      <Link to={localePath(lang, PAGES.privacy.path)} className="text-link" />
    ),
  }
}
