import type { ReactNode } from "react"
import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { ThemeToggle } from "@/components/theme-toggle"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SkipLink>Skip to content</SkipLink>
      <header className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-5" />
          <span className="border-s ps-3 text-sm font-medium text-muted-foreground">
            Admin
          </span>
        </div>
        <ThemeToggle />
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-6 pb-16"
      >
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="px-6 py-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} LetsHyre · Authorised staff only
      </footer>
    </div>
  )
}

export function AuthHeading({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
