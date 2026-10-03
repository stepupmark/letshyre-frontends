import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { useScoreCardsList } from "@/features/employee/hooks/useScoreCardsList";
import { ScoreCardItem } from "@/features/employee/components/score-cards/ScoreCardItem";
import { ScoreCardsSkeleton } from "@/features/employee/components/score-cards/ScoreCardsSkeleton";
import { EmptyScoreCards } from "@/features/employee/components/score-cards/EmptyScoreCards";
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    }
  },
};

export function ScoreCardsList() {
  const { t } = useTranslation("employee");
  const { data, isLoading, isError, error } = useScoreCardsList();

  const is404 =
    error?.response?.status === 404 ||
    data?.status === 404 ||
    (data?.data && data.data.length === 0);
  const scoreCards = data?.data || [];

  return (
    <>
      

      <div className="max-[640px]:p-4">
        <div className="mb-8 max-w-[65ch]">
          <h2 className="mb-1.5 text-[clamp(1.25rem,3vw,1.5rem)] leading-[1.2] font-semibold tracking-[-0.01em] text-brand-500">{t("scorecards.title")}</h2>
          <p className="text-sm leading-normal text-text-muted">
            {t("scorecards.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 max-md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-md:gap-4 max-[640px]:grid-cols-1">
            <ScoreCardsSkeleton count={3} />
          </div>
        ) : is404 || scoreCards.length === 0 ? (
          <EmptyScoreCards />
        ) : isError ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-200 bg-transparent px-6 py-20 text-center">
            <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-text-body">{t("scorecards.failedTitle")}</h3>
            <p className="mx-auto mb-6 max-w-105 text-base leading-[1.6] text-text-muted">{t("scorecards.failedBody")}</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 max-md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-md:gap-4 max-[640px]:grid-cols-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {scoreCards.map((scorecard) => (
              <motion.div key={scorecard.id} variants={itemVariants}>
                <ScoreCardItem scorecard={scorecard} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
