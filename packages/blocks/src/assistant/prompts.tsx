import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import type { Ask } from "./types"

// how long each example question stays in the empty input
const ROTATE_MS = 3500

export function RotatingPlaceholder({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, ROTATE_MS)
    return () => {
      clearInterval(id)
    }
  }, [items.length])

  return (
    <span
      key={index}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 top-1.5 animate-in truncate text-base text-muted-foreground duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
    >
      {items[index % items.length]}
    </span>
  )
}

/** The assistant's face in the conversation. */
export function AssistantMark({
  size = "sm",
  busy = false,
  className,
}: {
  size?: "sm" | "lg"
  busy?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center bg-brand-muted text-brand-text",
        size === "sm" ? "size-7 rounded-lg" : "size-11 rounded-xl",
        busy && "animate-pulse motion-reduce:animate-none",
        className
      )}
    >
      <Sparkles className={size === "sm" ? "size-3.5" : "size-5"} />
    </span>
  )
}

/** A greeting and a few questions to start with. */
export function AssistantSuggestions({
  greeting,
  hint,
  prompts,
  onPick,
}: {
  greeting: string
  hint: string
  prompts: string[]
  onPick: Ask
}) {
  return (
    <div className="mt-auto flex animate-in flex-col gap-4 duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-start gap-3">
        <AssistantMark />
        <div className="flex min-w-0 flex-col gap-1 pt-0.5">
          <p className="font-semibold tracking-tight text-balance">
            {greeting}
          </p>
          <p className="text-sm text-pretty text-muted-foreground">{hint}</p>
        </div>
      </div>
      <AssistantPrompts prompts={prompts} onPick={onPick} className="ps-10" />
    </div>
  )
}

/** Questions as chips; picking one asks it. */
export function AssistantPrompts({
  prompts,
  onPick,
  className,
}: {
  prompts: string[]
  onPick: Ask
  className?: string
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {prompts.map((prompt) => (
        <li key={prompt}>
          <Button
            variant="outline"
            size="sm"
            className="h-auto rounded-full py-1.5 text-start whitespace-normal hover:border-brand/40 hover:text-brand-text"
            onClick={() => {
              onPick(prompt)
            }}
          >
            {prompt}
          </Button>
        </li>
      ))}
    </ul>
  )
}
