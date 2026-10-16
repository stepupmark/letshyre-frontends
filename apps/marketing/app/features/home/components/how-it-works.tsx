import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  FileUpIcon,
  HandshakeIcon,
  ListOrderedIcon,
  LockOpenIcon,
  type LucideIcon,
  ScanSearchIcon,
  UserRoundIcon,
  VideoIcon,
} from "lucide-react"
import { Link } from "react-router"

import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

import { twoDigit } from "../lib/format"
import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"

interface Step {
  title: string
  body: string
}

export function HowItWorks() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const published = usePublished()
  const tracks = [
    {
      value: "employers",
      label: t("how.employers"),
      steps: t("how.employerSteps", { returnObjects: true }) as Step[],
      icons: [
        FileTextIcon,
        ListOrderedIcon,
        ScanSearchIcon,
        LockOpenIcon,
        HandshakeIcon,
      ],
      note: { text: t("how.employerNote"), step: 3 },
    },
    {
      value: "professionals",
      label: t("how.professionals"),
      steps: t("how.professionalSteps", { returnObjects: true }) as Step[],
      icons: [
        UserRoundIcon,
        FileUpIcon,
        VideoIcon,
        ClipboardCheckIcon,
        BriefcaseIcon,
      ],
      note: { text: t("how.professionalNote"), step: 0 },
    },
  ]

  return (
    <HomeSection id="how-it-works" muted>
      <Tabs defaultValue={tracks[0]?.value} className="gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <HomeHeading
            id="how-it-works-title"
            eyebrow={t("how.eyebrow")}
            title={t("how.title")}
            accent={t("how.accent")}
            className="reveal"
          />
          <TabsList
            aria-label={t("how.tabsLabel")}
            className="h-12! shrink-0 rounded-full border bg-background p-1"
          >
            {tracks.map((track) => (
              <TabsTrigger
                key={track.value}
                value={track.value}
                className="rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
              >
                {track.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tracks.map((track) => (
          <TabsContent key={track.value} value={track.value} keepMounted>
            <ol className="grid gap-4 md:grid-cols-6 xl:grid-cols-5 xl:pt-6">
              {track.steps.map((step, index) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={index}
                  icon={track.icons[index] ?? FileTextIcon}
                  last={index === track.steps.length - 1}
                  note={index === track.note.step ? track.note.text : undefined}
                />
              ))}
            </ol>
            {track.value === "employers" && published("employerGuide") && (
              <Link
                to={localePath(lang, PAGES.employerGuide.path)}
                prefetch="intent"
                className="more-link group/link mt-6 inline-flex items-center gap-1.5 text-sm"
              >
                {t("how.employerGuide")}
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100"
                />
              </Link>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </HomeSection>
  )
}

function StepCard({
  step,
  index,
  icon: Icon,
  last,
  note,
}: {
  step: Step
  index: number
  icon: LucideIcon
  last: boolean
  note?: string
}) {
  return (
    <li
      className={cn(
        "reveal relative flex flex-col rounded-2xl border p-5 sm:p-6 xl:col-span-1",
        index < 3 ? "md:col-span-2" : "md:col-span-3",
        last ? "border-primary bg-primary text-primary-foreground" : "bg-card"
      )}
    >
      {note && (
        <p
          aria-hidden
          className="font-script mb-3 -rotate-2 text-3xl text-brand-text xl:absolute xl:inset-s-4 xl:-top-9 xl:mb-0 xl:-rotate-3 xl:whitespace-nowrap"
        >
          {note}
        </p>
      )}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            last ? "bg-primary-foreground/15" : "bg-brand-muted text-brand-text"
          )}
        >
          <Icon aria-hidden className="size-5" />
        </span>
        <span
          aria-hidden
          className={cn(
            "font-display text-4xl leading-none tabular-nums",
            last ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {twoDigit(index + 1)}
        </span>
      </div>
      <h3 className="mt-5 text-base font-semibold xl:mt-8">{step.title}</h3>
      <p
        className={cn(
          "mt-2 text-sm text-pretty",
          last ? "text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {step.body}
      </p>
    </li>
  )
}
