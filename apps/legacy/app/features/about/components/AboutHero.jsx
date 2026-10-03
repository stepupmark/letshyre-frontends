import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import heroImg from "@/assets/about_hero.webp";

// Shared by AboutHero and AboutIntro.
export const ABOUT_TEXT_GRADIENT =
  "bg-linear-135 from-brand-600 to-brand-500 bg-clip-text text-transparent";

export function AboutHero() {
  const { t } = useTranslation("about");
  return (
    <motion.section
      className="relative flex flex-col pt-10 pb-2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-2 items-center gap-4 max-lg:grid-cols-1 max-lg:gap-2 max-lg:text-center">
        <div className="flex flex-col items-start max-lg:items-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-neutral-50 px-4 py-1.5 text-[0.85rem] font-bold tracking-[0.05em] text-neutral-500 uppercase shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            {t("hero.badge")}
          </div>
          <h1 className="mb-[clamp(1rem,2vw,1.5rem)] text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] font-extrabold tracking-[-0.02em]">
            <Trans
              t={t}
              i18nKey="hero.title"
              components={{ hl: <span className={ABOUT_TEXT_GRADIENT} />, br: <br /> }}
            />
          </h1>
          <p className="max-w-[650px] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.8] text-neutral-700">
            {t("hero.description")}
          </p>
        </div>
        <div className="relative flex h-auto py-8 lg:h-[500px] lg:py-0 w-full items-center justify-center">
          <div className="absolute z-0 h-[300px] w-[300px] lg:h-[400px] lg:w-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,rgba(255,255,255,0)_70%)] blur-[40px]" />
          <motion.img
            src={heroImg}
            alt={t("hero.imgAlt")}
            className="relative z-1 w-full max-w-[500px] rounded-xl object-cover shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.section>
  );
}
