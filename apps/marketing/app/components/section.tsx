import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps, ReactNode } from "react"

/** Page-width wrapper with the site gutters. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}

/** Vertical rhythm for a page band. Give it an `aria-labelledby` pointing at its heading. */
export function Section({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      <Container>{children}</Container>
    </section>
  )
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  className,
}: {
  id?: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      {eyebrow && (
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      )}
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="text-lg text-pretty text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

/** The h1 band at the top of every page except home. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="border-b">
      <Container className="flex flex-col gap-3 py-10 sm:py-14">
        {eyebrow && (
          <p className="text-sm font-semibold text-primary">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </Container>
    </header>
  )
}
