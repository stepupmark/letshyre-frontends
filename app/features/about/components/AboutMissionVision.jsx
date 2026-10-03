import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BIcon } from "@/components/icons/BootstrapIcons";

const BLOCK = "grid grid-cols-[1fr_2fr] items-start gap-10 max-md:grid-cols-1 max-md:gap-5";
const TITLE =
  "flex items-center gap-3 text-[clamp(1.25rem,2.5vw,2rem)] font-extrabold text-neutral-900 [&_i]:text-brand-600";
const DESC =
  "text-[clamp(1.05rem,1.25vw,1.25rem)] leading-[1.6] font-medium tracking-[-0.01em] text-text-muted";

export function AboutMissionVision() {
  const { t } = useTranslation("about");
  return (
    <motion.section
      className="flex flex-col gap-20 border-y border-border py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={BLOCK}>
        <h2 className={TITLE}>
          <BIcon name="bullseye" /> {t("mission.title")}
        </h2>
        <p className={DESC}>{t("mission.desc")}</p>
      </div>

      <div className={BLOCK}>
        <h2 className={TITLE}>
          <BIcon name="eye" /> {t("vision.title")}
        </h2>
        <p className={DESC}>{t("vision.desc")}</p>
      </div>
    </motion.section>
  );
}
