import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

import { RegisterLink } from "../components/register-link"

/** `<Trans>` components for the links the guide copy can contain. */
export function useGuideLinks() {
  const lang = useLocale()
  return {
    dl: (
      <Link
        to={localePath(lang, PAGES.download.path)}
        className="font-medium text-primary underline underline-offset-4"
      />
    ),
    reg: <RegisterLink />,
    pp: (
      <Link
        to={localePath(lang, PAGES.privacy.path)}
        className="font-medium text-primary underline underline-offset-4"
      />
    ),
  }
}
