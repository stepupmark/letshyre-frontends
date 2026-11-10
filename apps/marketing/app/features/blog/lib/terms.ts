import { createContext } from "react"

/** The glossary entries a post's `<Term>`s point at, by id. */
export const TermsContext = createContext<
  Readonly<Record<string, { term: string; short: string }>>
>({})
