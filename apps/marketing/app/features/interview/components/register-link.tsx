import type { ReactNode } from "react"

import { APP_LINKS } from "@/lib/app-links"

export function RegisterLink({ children }: { children?: ReactNode }) {
  return (
    <a href={APP_LINKS.candidateRegister} className="text-link">
      {children}
    </a>
  )
}
