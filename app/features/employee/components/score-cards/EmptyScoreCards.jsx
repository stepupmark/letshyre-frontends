import React from "react";
import { Link } from "react-router";
import { FileBarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";


export function EmptyScoreCards() {
  const { t } = useTranslation("employee");
  return (
    <motion.div 
      className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-200 bg-transparent px-6 py-20 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-lg bg-bg-subtle text-text-muted">
        <FileBarChart2 size={32} strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-text-body">{t("scorecards.emptyTitle")}</h3>
      <p className="mx-auto mb-6 max-w-105 text-base leading-[1.6] text-text-muted">
        {t("scorecards.emptyBody")}
      </p>
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link to="/employee/find-jobs" className="inline-flex cursor-pointer items-center gap-2 rounded-sm border-0 bg-text-body px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-text-main">
          {t("scorecards.emptyCta")}
        </Link>
      </motion.div>
    </motion.div>
  );
}
