import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { CopyIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { SocialIcon } from "@/components/social-links"

import { POST_BODY_ID } from "../lib/post-body"

const MIN = 10
const MAX = 400

interface Selected {
  text: string
  top: number
  left: number
}

function selectedQuote(): Selected | undefined {
  const selection = document.getSelection()
  const root = document.getElementById(POST_BODY_ID)
  if (
    !selection ||
    selection.isCollapsed ||
    !root ||
    selection.rangeCount === 0
  )
    return undefined
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return undefined
  const text = selection.toString().replace(/\s+/g, " ").trim()
  if (text.length < MIN || text.length > MAX) return undefined
  const rect = range.getBoundingClientRect()
  // below the selection, where the phone's own copy menu isn't
  const half = 120
  return {
    text,
    top: rect.bottom + 8,
    left: Math.min(
      Math.max(rect.left + rect.width / 2, half),
      window.innerWidth - half
    ),
  }
}

/** A link that scrolls to the quote and highlights it, in browsers that support text fragments. */
function quoteUrl(url: string, text: string) {
  const words = text.split(" ")
  const encode = (part: string) => encodeURIComponent(part).replace(/-/g, "%2D")
  const fragment =
    words.length <= 8
      ? encode(text)
      : `${encode(words.slice(0, 4).join(" "))},${encode(words.slice(-4).join(" "))}`
  return `${url}#:~:text=${fragment}`
}

/** Select a sentence in a post to copy it, or share it, with a link back to the spot. */
export default function QuoteShare({
  url,
  title,
}: {
  url: string
  title: string
}) {
  const { t } = useTranslation("blog")
  const [selected, setSelected] = useState<Selected>()

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setSelected(selectedQuote())
      })
    }
    document.addEventListener("selectionchange", update)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("selectionchange", update)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  if (!selected) return null
  const link = quoteUrl(url, selected.text)
  const quote = t("post.sourceQuote", { text: selected.text })
  const share = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      role="toolbar"
      aria-label={t("post.quoteActions")}
      style={{ top: selected.top, left: selected.left }}
      // keeps the selection when a button is pressed
      onPointerDown={(event) => {
        event.preventDefault()
      }}
      className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-popover p-1 text-popover-foreground print:hidden"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          void navigator.clipboard
            .writeText(`${quote}\n\n${title}\n${link}`)
            .then(() => toast.success(t("post.quoteCopied")))
        }}
      >
        <CopyIcon aria-hidden />
        {t("post.copyQuote")}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("post.quoteOn", { network: "LinkedIn" })}
        onClick={() => {
          share(
            `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${quote}\n\n${link}`)}`
          )
        }}
      >
        <SocialIcon network="linkedin" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("post.quoteOn", { network: "X" })}
        onClick={() => {
          share(
            `https://x.com/intent/post?text=${encodeURIComponent(quote)}&url=${encodeURIComponent(link)}`
          )
        }}
      >
        <SocialIcon network="x" />
      </Button>
    </div>
  )
}
