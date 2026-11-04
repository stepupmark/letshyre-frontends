import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { Heading } from "./heading"
import { Points } from "./points"
import { ScorecardScene } from "./scenes/scorecard-scene"
import { ShortlistScene } from "./scenes/shortlist-scene"
import { UnlockScene } from "./scenes/unlock-scene"

const STEPS = [
  { key: "shortlist", Scene: ShortlistScene },
  { key: "evidence", Scene: ScorecardScene },
  { key: "unlock", Scene: UnlockScene },
] as const

export function Features() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()

  return (
    <Band id="how">
      <Heading
        id="how-title"
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        accent={t("how.accent")}
        className="slide-in"
      />

      <Tabs defaultValue={0} className="slide-in mt-12 gap-0">
        <TabsList
          variant="line"
          aria-label={t("how.eyebrow")}
          className="grid h-auto! w-full grid-cols-3 items-start gap-4 border-t p-0 sm:gap-8"
        >
          {STEPS.map(({ key }, index) => (
            <TabsTrigger
              key={key}
              value={index}
              id={`${key}-tab`}
              className="-mt-px h-auto flex-col items-start justify-start gap-1 rounded-none border-0 border-t-2 border-transparent px-0 pt-5 pb-0 text-start text-base whitespace-normal after:hidden data-active:border-brand"
            >
              <span className="text-xs text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold">{t(`${key}.eyebrow`)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STEPS.map(({ key, Scene }, index) => (
          <TabsContent
            key={key}
            value={index}
            className="swap-in mt-10 grid items-center gap-10 text-base lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
          >
            <div>
              <Heading
                as="h3"
                id={`${key}-title`}
                title={t(`${key}.title`)}
                accent={t(`${key}.accent`)}
              />
              <p className="mt-4 text-pretty text-muted-foreground">
                {t(`${key}.body`)}
              </p>
              <Points
                items={t(`${key}.points`, { returnObjects: true })}
                className="mt-6"
              />
              {key === "unlock" && (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <CtaLink href={APP_LINKS.employerRegister}>
                    {t("unlock.cta")}
                    <ArrowRightIcon aria-hidden />
                  </CtaLink>
                  <TextLink to={localePath(lang, PAGES.pricing.path)}>
                    {t("unlock.pricing")}
                  </TextLink>
                </div>
              )}
            </div>
            <div className="rounded-3xl bg-muted/70 p-4 sm:p-8">
              <Scene />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Band>
  )
}
