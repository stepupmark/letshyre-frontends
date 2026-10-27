import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"

const AUDIENCES = {
  employers: { href: APP_LINKS.employerRegister, Icon: BriefcaseBusiness },
  seekers: { href: APP_LINKS.candidateRegister, Icon: UserRound },
}

export function SignUpCard({ audience }: { audience: keyof typeof AUDIENCES }) {
  const { t } = useTranslation("assistant")
  const { href, Icon } = AUDIENCES[audience]

  return (
    <div className="flex items-start gap-3 rounded-xl border p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-text">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-balance">
            {t(`chatbot.signUp.${audience}.title`)}
          </p>
          <p className="text-xs text-pretty text-muted-foreground">
            {t(`chatbot.signUp.${audience}.body`)}
          </p>
        </div>
        <a
          href={href}
          className={buttonVariants({ size: "sm", className: "self-start" })}
        >
          {t(`chatbot.signUp.${audience}.cta`)}
          <ArrowRight aria-hidden className="rtl:-scale-x-100" />
        </a>
      </div>
    </div>
  )
}
