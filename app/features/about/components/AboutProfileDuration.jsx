import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";

export function AboutProfileDuration() {
  const { t } = useTranslation("about");
  return (
    <motion.section
      className="flex w-full justify-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-[1000px]">
        <div className="flex flex-col gap-6">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-neutral-900 leading-[1.2]">
            {t("profileDuration.title")}
          </h2>
          <div className="flex flex-col gap-5 text-[clamp(1.05rem,1.25vw,1.15rem)] leading-[1.8] text-text-muted">
            <p>
              <Trans t={t} i18nKey="profileDuration.p1" components={{ b: <strong className="font-bold text-neutral-900" /> }} />
            </p>
            <p>{t("profileDuration.p2")}</p>
            <p>{t("profileDuration.p3")}</p>
            <p>{t("profileDuration.p4")}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
