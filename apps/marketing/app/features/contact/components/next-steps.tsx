import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, InboxIcon, MailIcon, RouteIcon } from "lucide-react"
import { useId } from "react"

import { wait } from "@/components/art/delay"

const STEPS = [
  { id: "received", icon: InboxIcon },
  { id: "routed", icon: RouteIcon },
  { id: "reply", icon: MailIcon },
] as const

/** What happens after sending; each step ticks off once the message is sent. */
export function NextSteps({ sent }: { sent: boolean }) {
  const { t } = useTranslation("contact")
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5">
      <h2 id={titleId} className="text-sm font-semibold text-muted-foreground">
        {t("next.title")}
      </h2>
      <ol className="flex flex-col">
        {STEPS.map(({ id, icon: Icon }, i) => {
          const last = i === STEPS.length - 1
          return (
            <li key={id} className="flex gap-4">
              <div aria-hidden className="flex flex-col items-center">
                <span
                  className={cn(
                    "relative grid size-10 shrink-0 place-items-center rounded-full border bg-background text-brand-text transition-colors duration-300",
                    sent && "border-transparent bg-brand-muted"
                  )}
                >
                  <Icon className="size-4.5" />
                  {sent && (
                    <span
                      className="pop absolute -inset-e-1 -top-1 grid size-4.5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
                      style={wait(i * 250)}
                    >
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
                {!last && (
                  <span className="relative my-1.5 w-px flex-1 bg-border">
                    <span
                      className={cn(
                        "absolute inset-0 origin-top bg-primary/60 transition-[scale] duration-500 ease-out motion-reduce:transition-none",
                        sent ? "scale-y-100" : "scale-y-0"
                      )}
                      style={{ transitionDelay: `${i * 250 + 100}ms` }}
                    />
                  </span>
                )}
              </div>
              <div
                className={cn("flex flex-col gap-0.5 pt-2", !last && "pb-6")}
              >
                <p className="font-medium">{t(`form.next.${id}`)}</p>
                {last && (
                  <p className="text-sm text-muted-foreground">
                    {t("channels.replyTime")}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
