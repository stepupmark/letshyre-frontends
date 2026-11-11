import { createContext } from "react"

export const TermsContext = createContext<
  Readonly<Record<string, { term: string; short: string }>>
>({})
