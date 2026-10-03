import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";

// `last:after:*` masks the timeline rule below the final badge so the line stops
// at the last step instead of running to the bottom of the container.
const STEP =
  "relative z-1 mb-8 flex gap-6 last:mb-0 last:after:absolute last:after:top-10 last:after:bottom-0 last:after:start-4 last:after:-z-10 last:after:w-1 last:after:bg-bg-page last:after:content-[''] max-md:gap-4 max-md:last:after:start-[11px]";

const BADGE =
  "relative top-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[0.9rem] font-bold text-white shadow-[0_0_0_4px_var(--color-bg-page)] max-md:top-1.5 max-md:h-6 max-md:w-6 max-md:text-[0.8rem]";

const BODY =
  "grow rounded-lg border border-border-soft bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-[transform,translate,scale,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] motion-reduce:hover:translate-y-0";

const ICON =
  "flex h-9 w-9 items-center justify-center rounded-md text-brand-600";

const HIW_CTA =
  "h-auto gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold whitespace-nowrap text-neutral-900 transition-all hover:-translate-y-px hover:bg-neutral-100 active:translate-y-px motion-reduce:hover:translate-y-0";
import {
  CircleDashed,
  Download,
  LogIn,
  LayoutDashboard,
  MonitorX,
  ShieldAlert,
  Fingerprint,
  Briefcase,
  PlaySquare,
  Lightbulb,
  ArrowRight
} from "lucide-react";
// Order + icons only; copy lives in the interview catalog keyed by `key`.
const steps = [
  { key: "download", icon: Download, rich: true },
  { key: "signIn", icon: LogIn },
  { key: "dashboard", icon: LayoutDashboard },
  { key: "clearEnv", icon: MonitorX, hasTip: true },
  { key: "permissions", icon: ShieldAlert },
  { key: "verifyId", icon: Fingerprint, hasTip: true },
  { key: "chooseRole", icon: Briefcase },
  { key: "begin", icon: PlaySquare, isAccent: true },
];

export function HowItWorks() {
  const navigate = useNavigate();
  const { t } = useTranslation("interview");
  const lang = useLocale();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-[120px] pb-20">

      {/* Hero Section */}
      <section className="mb-12 text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-[0.9rem] font-bold tracking-[0.01em] text-brand-700 shadow-[0_4px_14px_rgba(37,99,235,0.12)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CircleDashed size={14} />
          {t("badge")}
        </motion.div>

        <motion.h1
          className="mb-4 text-[clamp(2rem,5vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-neutral-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("title")}
        </motion.h1>

        <motion.p
          className="mx-auto max-w-[600px] text-[1.1rem] leading-[1.5] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t("intro")}
        </motion.p>
      </section>

      {/* Timeline Section */}
      <section className="relative mb-12">
        <motion.div
          className="relative ps-5 before:absolute before:top-0 before:bottom-0 before:start-9 before:z-0 before:w-0.5 before:bg-border-soft before:content-[''] max-md:before:start-[31px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.key}
                className={STEP}
                variants={itemVariants}
              >
                <div className={cn(BADGE, step.isAccent && "bg-brand-900")}>{i + 1}</div>
                <div className={cn(BODY, step.isAccent && "border-s-4 border-s-brand-900")}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className={cn(ICON, step.isAccent && "bg-brand-900 text-white")}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <h2 className="m-0 text-[1.25rem] font-bold text-neutral-900">{t(`steps.${step.key}.title`)}</h2>
                  </div>
                  <p className="m-0 text-[0.95rem] leading-[1.6] text-text-muted">
                    {step.rich ? (
                      <Trans
                        t={t}
                        i18nKey="steps.download.desc"
                        components={{
                          dl: (
                            <Link
                              to={localePath(lang, "/download")}
                              className="font-medium text-brand-600 underline decoration-transparent transition-all duration-200 hover:decoration-brand-600"
                            />
                          ),
                        }}
                      />
                    ) : (
                      t(`steps.${step.key}.desc`)
                    )}
                  </p>

                  {step.hasTip && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-success-bg px-3 py-2 text-[0.85rem] font-semibold text-success">
                      <Lightbulb size={14} className="text-success" />
                      {t(`steps.${step.key}.tip`)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <motion.section 
        className="flex items-center justify-between rounded-xl bg-neutral-900 p-8 text-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] max-md:flex-col max-md:gap-6 max-md:text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h3 className="mb-2 text-[1.5rem] font-bold text-white">{t("cta.title")}</h3>
          <p className="m-0 text-[0.95rem] text-neutral-400">{t("cta.desc")}</p>
        </div>
        <Button
          className={HIW_CTA}
          onClick={() => navigate(localePath(lang, "/download"))}
        >
          {t("cta.button")}
          <ArrowRight size={18} />
        </Button>
      </motion.section>
    </div>
  );
}
