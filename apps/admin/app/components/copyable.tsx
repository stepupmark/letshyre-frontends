import { useEffect, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

interface CopyableProps {
  value: string | null | undefined
  label: string
  children?: ReactNode
  className?: string
}

export function Copyable({ value, label, children, className }: CopyableProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1500)
    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  if (!value) return <span className="text-muted-foreground">—</span>

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Couldn't copy the ${label.toLowerCase()}`)
    }
  }

  return (
    <span
      className={cn("group/copy inline-flex items-center gap-1", className)}
    >
      <span className="min-w-0 break-all">{children ?? value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => {
          void copy()
        }}
        className="shrink-0 text-muted-foreground opacity-0 group-hover/copy:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </span>
  )
}
