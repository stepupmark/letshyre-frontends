import { useId, type ReactNode } from "react"

export function Group({
  id,
  title,
  aside,
  children,
}: {
  id?: string
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  const ownId = useId()
  const titleId = id ?? ownId
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={titleId} className="text-sm font-semibold">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

export function Option({ children }: { children: ReactNode }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm max-lg:min-h-11">
      {children}
    </label>
  )
}
