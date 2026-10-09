import { useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import {
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

import { Container } from "@/components/section"

import { HomeHeading } from "./home-heading"

interface Step {
  title: string
  body: string
}

export function HowItWorks() {
  const { t } = useTranslation("home")
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
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-20 bg-muted/40 py-14 sm:py-20"
    >
      <Container>
        <Tabs defaultValue={tracks[0]?.value} className="gap-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <HomeHeading
              id="how-title"
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
              <ol className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-5">
                {track.steps.map((step, index) => (
                  <StepCard
                    key={step.title}
                    step={step}
                    index={index}
                    icon={track.icons[index] ?? FileTextIcon}
                    last={index === track.steps.length - 1}
                    note={
                      index === track.note.step ? track.note.text : undefined
                    }
                  />
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </section>
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
        "reveal relative flex flex-col rounded-2xl border p-6",
        last ? "border-primary bg-primary text-primary-foreground" : "bg-card",
        note && "max-lg:mt-8"
      )}
    >
      {note && (
        <p
          aria-hidden
          className="font-script absolute inset-s-4 -top-9 -rotate-3 text-3xl whitespace-nowrap text-brand-text"
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
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-8 text-base font-semibold">{step.title}</h3>
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
