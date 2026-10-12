import { Trans, useFormat, useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { useDownloadState } from "../hooks/use-download-state"
import { StepArt, type StepId } from "./art/step-art"

const STEPS = ["download", "install", "interview"] as const satisfies StepId[]

export function InstallSteps() {
  const { t } = useTranslation("download")
  const format = useFormat()
  const { started } = useDownloadState()
  const titleId = useId()

  return (
    <section
      id="install"
      aria-labelledby={titleId}
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SectionHeader id={titleId} title={t("install.title")} />
      <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        <span
          aria-hidden
          className="grow-in absolute inset-s-9 inset-e-[calc(100%/3-4rem/3)] top-4.5 h-px origin-left bg-border max-md:hidden rtl:origin-right"
        >
          <span
            className={cn(
              "absolute inset-0 origin-left bg-primary transition-[scale] duration-700 ease-out motion-reduce:transition-none rtl:origin-right",
              started ? "scale-x-50" : "scale-x-0"
            )}
          />
        </span>
        {STEPS.map((id, index) => {
          const done = started && id === "download"
          const next = started && id === "install"
          return (
            <li key={id} className="group/step reveal flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "relative grid size-9 place-items-center rounded-full border bg-background text-sm font-semibold tabular-nums transition-colors duration-300",
                    done &&
                      "border-transparent bg-primary text-primary-foreground",
                    next &&
                      "ring-once border-brand bg-brand-muted text-brand-text"
                  )}
                >
                  {done ? (
                    <CheckIcon className="pop size-4" strokeWidth={3} />
                  ) : (
                    format.number(index + 1, { minimumIntegerDigits: 2 })
                  )}
                </span>
                {next && (
                  <span className="rise relative bg-background pe-2 text-sm font-medium text-brand-text">
                    {t("next.badge")}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl border bg-muted/40 p-4 transition-colors duration-500",
                  next && "border-brand/40 bg-brand-muted/40"
                )}
              >
                <StepArt step={id} active={done || next} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg/7 font-semibold tracking-tight">
                  {t(`steps.${id}`)}
                </h3>
                <p className="text-base/6 text-pretty text-muted-foreground">
                  {id === "interview" ? (
                    <Trans
                      t={t}
                      i18nKey="install.interview"
                      components={{
                        signIn: (
                          <Link
                            to={APP_LINKS.candidateSignIn}
                            reloadDocument
                            className="font-medium text-primary underline underline-offset-4"
                          />
                        ),
                      }}
                    />
                  ) : (
                    t(`install.${id}`)
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
