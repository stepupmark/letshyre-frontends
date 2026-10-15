import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "@workspace/i18n/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { Coins } from "lucide-react"
import type { Ref } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"
import { locale } from "@/lib/i18n"

export function CreditsButton({ ref }: { ref: Ref<HTMLAnchorElement> }) {
  const { t } = useTranslation("shell")
  const { data } = useQuery(creditsQuery())
  const count = data?.available_credits
  const label =
    count === undefined ? t("credits.add") : t("credits.label", { count })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <AppLink
            ref={ref}
            to={href("/employer/billing")}
            aria-label={label}
            className={buttonLink({
              variant: "outline",
              className: "gap-1.5 rounded-full tabular-nums",
            })}
          />
        }
      >
        <Coins className="text-primary" />
        {count !== undefined && (
          <AnimatedNumber value={count} locale={locale} />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
