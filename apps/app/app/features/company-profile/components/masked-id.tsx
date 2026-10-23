import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"

import { masked } from "../lib/company"

export function MaskedId({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation(["company", "common"])
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => {
      clearTimeout(id)
    }
  }, [copied])

  return (
    <span className="flex items-center gap-1">
      <span
        key={String(shown)}
        className="settle me-auto truncate font-mono text-sm tabular-nums"
      >
        {shown ? value : masked(value)}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t(shown ? "legal.hide" : "legal.show", { label })}
        aria-pressed={shown}
        onClick={() => {
          setShown((prev) => !prev)
        }}
      >
        {shown ? <EyeOff /> : <Eye />}
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("legal.copy", { label })}
        onClick={() => {
          void navigator.clipboard.writeText(value).then(() => {
            setCopied(true)
          })
        }}
      >
        {copied ? <Check className="pop text-success" /> : <Copy />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? t("common:copy.copied") : ""}
      </span>
    </span>
  )
}
