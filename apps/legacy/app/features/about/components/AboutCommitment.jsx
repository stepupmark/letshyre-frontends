import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const CTA =
  "relative z-1 mt-5 inline-block cursor-pointer rounded-md border-none bg-brand-600 px-8 py-4 text-[1.05rem] font-semibold text-white no-underline shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.6)] motion-reduce:hover:translate-y-0";

export function AboutCommitment() {
  const { t } = useTranslation("about");
  return (
    <motion.section
      className="relative flex flex-col items-center gap-7 overflow-hidden rounded-[32px] border border-border bg-neutral-50 px-[clamp(20px,5vw,40px)] py-[clamp(60px,8vw,100px)] text-center text-neutral-900 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_70%)]" />
      <h2 className="relative z-1 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-[-0.02em] text-neutral-900">
        {t("commitment.title")}
      </h2>
      <p className="relative z-1 max-w-[800px] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.8] text-text-muted">
        {t("commitment.body")}
      </p>
      <p className="relative z-1 mt-8 text-[clamp(1.1rem,1.5vw,1.35rem)] font-semibold text-neutral-900">
        {t("commitment.contactUs")}
      </p>

      <a href="mailto:support@letshyre.ai" className={CTA}>
        support@letshyre.ai
      </a>
    </motion.section>
  );
}
