import { cn } from "@workspace/ui/lib/utils"
import { Building2, ExternalLink } from "lucide-react"
import { useCallback, useId, type ReactNode } from "react"

export function Panel({
  title,
  note,
  action,
  className,
  children,
}: {
  title: string
  note?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "settle flex flex-col gap-4 rounded-xl border p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          {note && (
            <p className="text-sm text-pretty text-muted-foreground">{note}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Fact({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm wrap-break-word">{children}</dd>
    </div>
  )
}

export function Outbound({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-1 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      {children}
      <ExternalLink
        aria-hidden="true"
        className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none rtl:-scale-x-100"
      />
    </a>
  )
}

export function CompanyLogo({
  src,
  file = null,
  className,
}: {
  src: string | null
  file?: File | null
  className?: string
}) {
  // the object URL lives exactly as long as the img
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !file) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
      }
    },
    [file]
  )
  return (
    <span
      className={cn(
        "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted",
        className
      )}
    >
      {file ? (
        <img
          key={file.name + String(file.lastModified)}
          ref={attach}
          alt=""
          className="pop size-full object-cover"
        />
      ) : src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <Building2
          aria-hidden="true"
          className="size-1/2 text-muted-foreground"
        />
      )}
    </span>
  )
}
