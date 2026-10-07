import type { ReactNode } from "react"

import { APP_LINKS } from "@/lib/app-links"

export function RegisterLink({ children }: { children?: ReactNode }) {
  return (
    <a
      href={APP_LINKS.candidateRegister}
      className="font-medium text-primary underline underline-offset-4"
    >
      {children}
    </a>
  )
}
