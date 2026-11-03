import { useTranslation } from "@workspace/i18n/react"

import { wait } from "@/components/art/delay"
import { Container } from "@/components/section"

import { AudienceCtas } from "../audience-ctas"
import { ExplainedShot } from "./product-shot"
import { APPLICANT_SPOTS, APPLICANTS } from "./shots"

export function Hero() {
  const { t } = useTranslation(["home", "homeV2"])

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="pt-12 pb-16 sm:pt-20 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lift lg:col-span-7">
            <p className="text-sm font-semibold text-brand-text">
              {t("home:hero.eyebrow")}
            </p>
            <h1
              id="hero-title"
              className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            >
              {t("home:hero.title")}{" "}
              <span className="relative inline-block text-brand-text">
                {t("home:hero.accent")}
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute inset-x-0 -bottom-2 h-3 w-full text-brand"
                >
                  <path
                    pathLength={1}
                    d="M3 9C48 4 120 2 197 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="ink"
                  />
                </svg>
              </span>
            </h1>
          </div>
          <div className="lift lg:col-span-5 lg:pb-2" style={wait(120)}>
            <p className="text-lg text-pretty text-muted-foreground">
              {t("home:hero.description")}
            </p>
            <AudienceCtas className="mt-8" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("home:hero.reassurance")}
            </p>
          </div>
        </div>

        <div className="lift mt-14 sm:mt-20" style={wait(240)}>
          <ExplainedShot
            shot={APPLICANTS}
            alt={t("homeV2:hero.alt")}
            sizes="(min-width: 1152px) 1104px, 100vw"
            callouts={t("homeV2:hero.callouts", { returnObjects: true })}
            spots={APPLICANT_SPOTS}
            note={t("homeV2:sample")}
            priority
            onLoad
          />
        </div>
      </Container>
    </section>
  )
}
