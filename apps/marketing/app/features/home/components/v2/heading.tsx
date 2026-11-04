import { cn } from "@workspace/ui/lib/utils"

export function Heading({
  id,
  as: Tag = "h2",
  eyebrow,
  title,
  accent,
  description,
  className,
}: {
  id?: string
  as?: "h2" | "h3"
  eyebrow?: string
  title: string
  accent: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col", className)}>
      {eyebrow && (
        <p className="mb-4 text-sm font-medium text-brand-text">{eyebrow}</p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-semibold tracking-tight text-balance",
          Tag === "h2"
            ? "text-3xl sm:text-4xl lg:text-5xl"
            : "text-2xl sm:text-3xl"
        )}
      >
        {title} <span className="text-muted-foreground">{accent}</span>
      </Tag>
      {description && (
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
