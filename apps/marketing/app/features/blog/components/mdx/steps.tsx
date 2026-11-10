import type { ReactNode } from "react"

export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-2 flex flex-col gap-6 [counter-reset:step]">
      {children}
    </ol>
  )
}

export function Step({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <li className="flex gap-4 [counter-increment:step] before:grid before:size-8 before:shrink-0 before:place-items-center before:rounded-full before:border before:bg-background before:text-sm before:font-semibold before:text-foreground before:tabular-nums before:content-[counter(step)] print:break-inside-avoid">
      <div className="flex min-w-0 flex-col gap-2 pt-1">
        <p className="font-semibold text-balance text-foreground">{title}</p>
        {children}
      </div>
    </li>
  )
}
