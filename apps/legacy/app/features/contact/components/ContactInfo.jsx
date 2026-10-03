import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { BIcon } from "@/components/icons/BootstrapIcons";

export function ContactInfo() {
  const { t } = useTranslation("contact");
  return (
    <motion.div
      className="relative flex flex-col justify-start"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute top-1/2 left-[20%] -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,rgba(255,255,255,0)_60%)]" />

      <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-bg-subtle px-3.5 py-1.5 text-sm font-medium text-text-muted">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold tracking-[0.05em] text-brand-600 uppercase">
          {t("info.badge")}
        </span>{" "}
        {t("info.helpCenter")}
      </div>

      <h1 className="mb-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-text-main">
        <Trans
          t={t}
          i18nKey="info.title"
          components={{
            hl: (
              <span className="bg-linear-135 from-brand-600 to-brand-500 bg-clip-text text-transparent" />
            ),
            br: <br />,
          }}
        />
      </h1>

      <p className="mb-10 max-w-[540px] text-[clamp(0.95rem,1.5vw,1.1rem)] leading-[1.6] text-neutral-500">
        {t("info.description")}
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-[0.85rem] font-semibold tracking-[0.05em] text-neutral-500 uppercase">
          {t("info.emailLabel")}
        </span>
        <a
          href="mailto:support@letshyre.ai"
          className="flex items-center gap-3 text-2xl font-bold text-text-main no-underline transition-colors duration-200 hover:text-brand-600"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-[1.2rem] text-brand-600">
            <BIcon name="envelope-fill" />
          </span>
          support@letshyre.ai
        </a>
      </div>
    </motion.div>
  );
}
