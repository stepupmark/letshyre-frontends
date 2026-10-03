import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRight,
  Download,
  Fingerprint,
  LayoutDashboard,
  LogIn,
  Lightbulb,
  MonitorX,
  Briefcase,
  PlaySquare,
  ShieldAlert,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";

// Order + icons only; copy lives in the interviewGuide catalog keyed by `key`.
const PHASES = [
  {
    id: "setup",
    steps: [
      { key: "download", icon: Download, rich: true },
      { key: "signIn", icon: LogIn },
      { key: "dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "security",
    steps: [
      { key: "clearEnv", icon: MonitorX, hasTip: true },
      { key: "permissions", icon: ShieldAlert },
      { key: "verifyId", icon: Fingerprint, hasTip: true },
    ],
  },
  {
    id: "interview",
    steps: [
      { key: "chooseRole", icon: Briefcase },
      { key: "begin", icon: PlaySquare, isAccent: true },
    ],
  },
];

// Steps are numbered across phases, not within them.
const STEP_NUMBER = Object.fromEntries(
  PHASES.flatMap((phase) => phase.steps).map((step, i) => [step.key, i + 1]),
);

const PHASE_LABEL =
  "px-5 pt-4 pb-2 text-xs font-semibold tracking-[0.08em] text-text-faint uppercase";
const NUMBER =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700";
const STEP_ICON =
  "flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-page text-brand-600";

export function InterviewGuide() {
  const { t } = useTranslation("interviewGuide");
  const { t: tNav } = useTranslation("dashboard");
  const lang = useLocale();

  return (
    <div>
      <div className="mb-6 max-w-[65ch]">
        <h2 className="mb-1.5 text-[clamp(1.25rem,3vw,1.5rem)] leading-[1.2] font-semibold tracking-[-0.01em] text-brand-500">
          {tNav("nav.interviewGuide")}
        </h2>
        <p className="text-sm leading-normal text-text-muted">{t("intro")}</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          {PHASES.map((phase) => (
            <Card key={phase.id} className="gap-0 py-0">
              <p className={PHASE_LABEL}>{t(`phases.${phase.id}`)}</p>
              <Accordion type="multiple" className="px-4 pb-1">
                {phase.steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <AccordionItem key={step.key} value={step.key}>
                      <AccordionTrigger className="items-center gap-3 py-4 hover:no-underline">
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <span
                            className={cn(
                              NUMBER,
                              step.isAccent && "bg-brand-900 text-white",
                            )}
                          >
                            {STEP_NUMBER[step.key]}
                          </span>
                          <span
                            className={cn(
                              STEP_ICON,
                              step.isAccent && "bg-brand-900 text-white",
                            )}
                          >
                            <Icon size={16} strokeWidth={1.5} />
                          </span>
                          <span className="truncate text-[0.95rem] font-semibold text-text-main">
                            {t(`steps.${step.key}.title`)}
                          </span>
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="ps-10 pe-2 pb-5">
                        <p className="m-0 text-sm leading-relaxed text-text-muted">
                          {step.rich ? (
                            <Trans
                              t={t}
                              i18nKey="steps.download.desc"
                              components={{
                                dl: (
                                  <Link
                                    to={localePath(lang, "/download")}
                                    className="font-medium text-brand-600 underline decoration-transparent transition-all hover:decoration-brand-600"
                                  />
                                ),
                              }}
                            />
                          ) : (
                            t(`steps.${step.key}.desc`)
                          )}
                        </p>

                        {step.hasTip && (
                          <Badge className="mt-3 gap-1.5 bg-success-bg px-3 py-1.5 text-xs font-semibold whitespace-normal text-success">
                            <Lightbulb className="size-3.5 shrink-0" />
                            {t(`steps.${step.key}.tip`)}
                          </Badge>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </Card>
          ))}
        </div>

        <Card className="gap-0 border-0 bg-neutral-900 p-5 lg:sticky lg:top-5">
          <CardTitle className="mb-1.5 text-base font-bold text-white">
            {t("cta.title")}
          </CardTitle>
          <p className="mb-4 text-xs leading-relaxed text-neutral-400">
            {t("cta.desc")}
          </p>
          <Button
            asChild
            className="h-auto w-full gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            <Link to={localePath(lang, "/download")}>
              {t("cta.button")}
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
