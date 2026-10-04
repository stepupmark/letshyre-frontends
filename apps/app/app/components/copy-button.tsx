import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

export function CopyButton({
  value,
  label,
}: {
  value: string
  label?: string
}) {
  const { t } = useTranslation("common")
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
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
        })
      }}
    >
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">
        {copied ? t("copy.copied") : (label ?? t("copy.copy"))}
      </span>
    </Button>
  )
}
