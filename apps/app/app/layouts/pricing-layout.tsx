import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import { Outlet } from "react-router"

import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [namespaces(["shell", "pricing"])]

export default function PricingLayout() {
  const { t } = useTranslation("shell")

  return (
    <>
      <SkipLink>{t("skipToContent")}</SkipLink>
      <main id="main" tabIndex={-1} className="min-h-svh outline-none">
        <Outlet />
      </main>
    </>
  )
}
