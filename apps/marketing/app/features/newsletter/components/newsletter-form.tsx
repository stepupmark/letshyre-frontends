import { useTranslation } from "@workspace/i18n/react"
import { lazy, Suspense, useId } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

import { NewsletterFields } from "./newsletter-fields"

// keeps react-hook-form, zod and the API client out of every page's initial JS; a prerendered
// Suspense needs inline scripts the CSP blocks, so it loads after hydration
const SubscribeForm = lazy(() => import("./subscribe-form"))

export function NewsletterForm() {
  const { t } = useTranslation("common")
  const id = useId()
  const hydrated = useHydrated()
  const placeholder = <NewsletterFields id={id} />

  return (
    <div className="grid gap-4 rounded-2xl border bg-background p-5 sm:p-6 md:grid-cols-2 md:items-center md:gap-8">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-sm font-semibold">
          {t("footer.stayUpdated")}
        </h2>
        <p id={`${id}-desc`} className="text-sm text-muted-foreground">
          {t("footer.newsletterDesc")}
        </p>
      </div>

      {hydrated ? (
        <Suspense fallback={placeholder}>
          <SubscribeForm id={id} />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  )
}
