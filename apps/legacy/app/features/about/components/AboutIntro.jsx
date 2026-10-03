import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { ABOUT_TEXT_GRADIENT } from "./AboutHero";

export function AboutIntro() {
  const { t } = useTranslation("about");
  return (
    <motion.section
      className="relative flex w-full items-center justify-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid max-w-[1100px] grid-cols-[1fr_1.5fr] items-start gap-[clamp(40px,6vw,80px)] text-start max-lg:grid-cols-1 max-lg:px-[clamp(20px,4vw,40px)]">
        <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2] font-extrabold text-neutral-900">
          <Trans
            t={t}
            i18nKey="intro.title"
            components={{ hl: <span className={ABOUT_TEXT_GRADIENT} />, br: <br /> }}
          />
        </h2>
        <div className="flex flex-col gap-6 text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.8] text-text-muted">
          <p>{t("intro.p1")}</p>
          <p>{t("intro.p2")}</p>
        </div>
      </div>
    </motion.section>
  );
}
