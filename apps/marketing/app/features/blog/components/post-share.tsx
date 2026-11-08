import { useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { CheckIcon, LinkIcon, MailIcon } from "lucide-react"

import { SocialIcon } from "@/components/social-links"
import { useCopy } from "@/hooks/use-copy"

const iconLink = buttonVariants({ variant: "outline", size: "icon-lg" })

export function PostShare({ url, title }: { url: string; title: string }) {
  const { t } = useTranslation("blog")
  const { canCopy, copied, copy } = useCopy()
  const link = encodeURIComponent(url)
  const text = encodeURIComponent(title)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="me-1 text-sm font-medium">{t("post.share")}</p>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${link}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("post.shareOn", { network: "LinkedIn" })}
        className={iconLink}
      >
        <SocialIcon network="linkedin" />
      </a>
      <a
        href={`https://x.com/intent/post?url=${link}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("post.shareOn", { network: "X" })}
        className={iconLink}
      >
        <SocialIcon network="x" />
      </a>
      <a
        href={`mailto:?subject=${text}&body=${link}`}
        aria-label={t("post.shareEmail")}
        className={iconLink}
      >
        <MailIcon aria-hidden />
      </a>
      {canCopy && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            copy(url)
          }}
        >
          {copied ? <CheckIcon aria-hidden /> : <LinkIcon aria-hidden />}
          <span aria-live="polite">
            {copied ? t("post.copied") : t("post.copyLink")}
          </span>
        </Button>
      )}
    </div>
  )
}
