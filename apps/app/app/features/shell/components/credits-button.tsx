import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { creditsQuery, LOW_CREDITS } from "@/lib/credits"
import { locale } from "@/lib/i18n"

export function CreditsButton({ ref }: { ref: Ref<HTMLAnchorElement> }) {
  const { t } = useTranslation("shell")
  const { data, isPending } = useQuery(creditsQuery())
  const count = data?.available_credits
  const low = count !== undefined && count <= LOW_CREDITS
  const balance = count === undefined ? null : t("credits.label", { count })
  const label = balance
    ? low
      ? t("credits.low", { balance })
      : balance
    : t("credits.add")

  if (isPending)
    return (
      <Skeleton
        role="status"
        aria-label={t("credits.loading")}
        className="h-8 w-16 rounded-full max-md:h-10"
      />
    )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <AppLink
            ref={ref}
            to={href("/employer/billing")}
            aria-label={label}
            data-low={low}
            className={buttonLink({
              variant: "outline",
              className:
                "gap-1.5 rounded-full tabular-nums data-[low=true]:border-warning/50 data-[low=true]:text-warning max-md:h-10",
            })}
          />
        }
      >
        <Coins className="text-primary" />
        {count !== undefined && (
          <AnimatedNumber value={count} locale={locale} />
        )}
        {low && (
          <span
            aria-hidden="true"
            className="pop size-1.5 rounded-full bg-warning"
          />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
