import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"

import { SITE } from "@/lib/seo/site"

import { type SocialNetwork, socialNetwork } from "./site-footer-links"

function SocialIcon({ network }: { network: SocialNetwork }) {
  const props: ComponentProps<"svg"> = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  }

  switch (network) {
    case "linkedin":
      return (
        <svg {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    case "x":
      return (
        <svg {...props}>
          <path d="M4 4l11.7 16H20L8.3 4z" />
          <path d="M4 20l6.8-6.8m2.4-2.4L20 4" />
        </svg>
      )
    case "instagram":
      return (
        <svg {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" />
          <path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z" />
          <path d="M17.5 6.5h.01" />
        </svg>
      )
    case "youtube":
      return (
        <svg {...props}>
          <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      )
  }
}

export function SiteFooterSocial() {
  const { t } = useTranslation("common")

  return (
    <ul aria-label={t("footer.social")} className="flex items-center gap-1">
      {SITE.sameAs.map((url) => {
        const network = socialNetwork(url)
        if (!network) return null
        return (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(`footer.socialLinks.${network}`)}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon-lg",
                  className: "text-muted-foreground",
                })
              )}
            >
              <SocialIcon network={network} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
