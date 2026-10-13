import { cn } from "@workspace/ui/lib/utils"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"

import { splitNumber, type TocEntry } from "../lib/legal-doc"

function TocLink({
  id,
  active,
  className,
  onNavigate,
  children,
}: {
  id: string
  active?: string
  className?: string
  onNavigate?: () => void
  children: ReactNode
}) {
  return (
    <a
      href={`#${id}`}
      aria-current={id === active ? "location" : undefined}
      onClick={onNavigate}
      className={cn(
        "relative block rounded-md px-3 text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=location]:font-medium aria-[current=location]:text-brand-text",
        className
      )}
    >
      {children}
    </a>
  )
}

export function LegalToc({
  entries,
  active,
  onNavigate,
}: {
  entries: TocEntry[]
  active?: string
  onNavigate?: () => void
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const [pill, setPill] = useState<{ top: number; height: number }>()

  useLayoutEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(
      '[aria-current="location"]'
    )
    setPill(
      link ? { top: link.offsetTop, height: link.offsetHeight } : undefined
    )
  }, [active])

  return (
    <ol ref={listRef} className="relative flex flex-col gap-0.5 text-sm">
      {pill && (
        <span
          aria-hidden
          style={pill}
          className="absolute inset-x-0 rounded-md bg-brand-muted transition-[top,height] duration-300 ease-out motion-reduce:transition-none"
        />
      )}
      {entries.map((entry) => {
        const { number, rest } = splitNumber(entry.title)
        const within = entry.children.some((child) => child.id === active)
        return (
          <li key={entry.id}>
            <TocLink
              id={entry.id}
              active={active}
              onNavigate={onNavigate}
              className={cn("py-1.5", within && "text-foreground")}
            >
              {number && <span className="tabular-nums">{number}. </span>}
              {rest}
            </TocLink>
            {entry.children.length > 0 && (
              <ol className="flex flex-col">
                {entry.children.map((child) => (
                  <li key={child.id}>
                    <TocLink
                      id={child.id}
                      active={active}
                      onNavigate={onNavigate}
                      className="py-1 ps-7 text-[0.8125rem]"
                    >
                      {child.title}
                    </TocLink>
                  </li>
                ))}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}
