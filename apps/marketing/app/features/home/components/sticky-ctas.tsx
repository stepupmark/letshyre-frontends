import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

import { APP_LINKS } from "@/lib/app-links"

/**
 * Both sign-up paths pinned to the bottom of a phone screen, from when the hero scrolls
 * away until the closing call to action, which repeats them, comes into view.
 */
export function StickyCtas() {
  const { t } = useTranslation("home")
  const shown = useBetweenCtas()

  return (
    <div
      inert={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background px-4 pt-3 pb-[max(--spacing(3),env(safe-area-inset-bottom))] transition duration-200 motion-reduce:transition-none lg:hidden print:hidden",
        shown ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <a
          href={APP_LINKS.employerRegister}
          className={cn(buttonVariants({ size: "lg" }), "h-11 flex-1")}
        >
          {t("hero.ctaHiring")}
        </a>
        <a
          href={APP_LINKS.candidateRegister}
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "h-11 flex-1"
          )}
        >
          {t("hero.ctaCandidate")}
        </a>
      </div>
    </div>
  )
}

function useBetweenCtas() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const hero = document.querySelector("[data-watch=hero]")
    const final = document.querySelector("[data-watch=final]")
    if (!hero || !final) return
    let pastHero = false
    let atFinal = false
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const above = entry.boundingClientRect.top < 0
        if (entry.target === hero) pastHero = !entry.isIntersecting && above
        else atFinal = entry.isIntersecting || above
      }
      setShown(pastHero && !atFinal)
    })
    observer.observe(hero)
    observer.observe(final)
    return () => {
      observer.disconnect()
    }
  }, [])

  // the chat launcher reads this to sit above the bar
  useEffect(() => {
    const root = document.documentElement
    if (shown) root.dataset.ctaBar = ""
    return () => {
      delete root.dataset.ctaBar
    }
  }, [shown])

  return shown
}
