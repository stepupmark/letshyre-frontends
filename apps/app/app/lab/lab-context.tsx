import { useEffect, useMemo, useState, type ReactNode } from "react"

import { copy, type Lang } from "./copy"
import { dashboard } from "./fixtures"
import { LabContext, type Lab, type ViewState } from "./use-lab"

export function LabProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")
  const [view, setView] = useState<ViewState>("ready")
  const [credits, setCredits] = useState(dashboard.credits.available)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  const value = useMemo<Lab>(
    () => ({
      lang,
      setLang,
      view,
      setView,
      credits,
      spend: (amount) => {
        setCredits((c) => c - amount)
      },
      t: (key, vars = {}) =>
        copy[lang][key].replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
          String(vars[name] ?? "")
        ),
    }),
    [lang, view, credits]
  )

  return <LabContext value={value}>{children}</LabContext>
}
