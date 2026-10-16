import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  BriefcaseIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  FileUpIcon,
  HandshakeIcon,
  ListOrderedIcon,
  LockOpenIcon,
  ScanSearchIcon,
  UserRoundIcon,
  VideoIcon,
} from "lucide-react"

import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

import { HomeHeading } from "./home-heading"
import { TextLink } from "./home-links"
import { HomeSection } from "./home-section"
import { type Step, StepTrack } from "./step-track"

export function HowItWorks() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const published = usePublished()
  const candidateGuide = published("candidateGuide")
    ? PAGES.candidateGuide
    : PAGES.interview
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
      guide: published("employerGuide") && {
        to: localePath(lang, PAGES.employerGuide.path),
        label: t("how.employerGuide"),
      },
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
      guide: {
        to: localePath(lang, candidateGuide.path),
        label: t("professionals.guide"),
      },
    },
  ]

  return (
    <HomeSection id="how-it-works">
      <Tabs defaultValue={tracks[0]?.value} className="gap-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <HomeHeading
            id="how-it-works-title"
            eyebrow={t("how.eyebrow")}
            title={t("how.title")}
            accent={t("how.accent")}
            className="slide-in"
          />
          <TabsList
            aria-label={t("how.tabsLabel")}
            className="h-12! shrink-0 self-start rounded-full border bg-muted/60 p-1 lg:self-auto"
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
            <StepTrack
              steps={track.steps}
              icons={track.icons}
              note={track.note}
            />
            {track.guide && (
              <TextLink to={track.guide.to} className="mt-8">
                {track.guide.label}
              </TextLink>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </HomeSection>
  )
}
