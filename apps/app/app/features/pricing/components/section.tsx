import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps, ReactNode } from "react"

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}

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
  title,
  description,
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
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
