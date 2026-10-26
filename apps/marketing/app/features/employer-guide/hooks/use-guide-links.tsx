import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"
import { TextLink } from "@/components/guide/text-link"

import { CHAPTER_ANCHORS, JD_ANCHOR } from "../lib/chapters"

/** `<Trans>` components for the links the guide copy can contain. */
export function useGuideLinks() {
  const lang = useLocale()
  return {
    reg: <TextLink href={APP_LINKS.employerRegister} />,
    team: <TextLink href={`#${CHAPTER_ANCHORS.team}`} />,
    jd: <TextLink href={`#${JD_ANCHOR}`} />,
    refund: (
      <Link to={localePath(lang, PAGES.refund.path)} className="text-link" />
    ),
  }
}
