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

/** The h1 band at the top of every page except home. `art` sits beside the copy on large screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  art,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  art?: ReactNode
}) {
  return (
    <header className="overflow-hidden border-b">
      <Container
        className={cn(
          "py-10 sm:py-14",
          art &&
            "grid items-center gap-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]"
        )}
      >
        <div className="flex flex-col gap-4">
          {eyebrow && (
            <p className="text-sm font-semibold text-primary">{eyebrow}</p>
          )}
          <h1
            className={cn(
              "text-4xl/[1.1] font-semibold tracking-tight text-balance sm:text-5xl/[1.05]",
              art ? "max-w-xl" : "max-w-3xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-lg/7 text-pretty text-muted-foreground">
              {description}
            </p>
          )}
          {children}
        </div>
        {art && (
          <div className="mx-auto w-full max-w-md max-sm:hidden lg:max-w-none">
            {art}
          </div>
        )}
      </Container>
    </header>
  )
}
