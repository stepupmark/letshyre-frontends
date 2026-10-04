import { createContext, useContext } from "react"

import type { CopyKey, Lang } from "./copy"

export type ViewState = "ready" | "loading" | "empty" | "error"

export interface Lab {
  lang: Lang
  setLang: (lang: Lang) => void
  view: ViewState
  setView: (view: ViewState) => void
  credits: number
  spend: (amount: number) => void
  t: (key: CopyKey, vars?: Record<string, string | number>) => string
}

export const LabContext = createContext<Lab | null>(null)

export function useLab() {
  const lab = useContext(LabContext)
  if (!lab) throw new Error("useLab outside LabProvider")
  return lab
}
