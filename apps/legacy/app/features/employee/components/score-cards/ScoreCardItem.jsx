import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, Cpu, ArrowRight } from "lucide-react";
import { useFormatters } from "@/i18n/format";


export function ScoreCardItem({ scorecard }) {
  const { t } = useTranslation("employee");
  const { formatDateLong } = useFormatters();
  const {
    id,
    overall_score,
    category_scores,
    created_at,
    candidate_skills,
    ai_model_name,
  } = scorecard;

  const formattedDate = formatDateLong(created_at);

  // Display max 3 skills, then "+X more"
  const visibleSkills = candidate_skills?.slice(0, 3) || [];
  const remainingSkillsCount =
    (candidate_skills?.length || 0) - visibleSkills.length;

  return (
    <motion.div 
      className="relative flex flex-col rounded-lg border border-brand-100 bg-card p-6 shadow-[0_1px_3px_rgb(0_0_0_/_0.02)] transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-brand-200 hover:shadow-[0_12px_32px_-12px_rgb(0_0_0_/_0.08)] max-[640px]:p-5"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="m-0 mb-1 flex items-center gap-2 text-base font-bold capitalize text-text-body">
            {category_scores?.candidate_role || t("scorecards.na")}
          </h3>
          <p className="flex items-center gap-1 text-sm text-text-muted">
            <Calendar size={14} strokeWidth={2} />
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-500">
          {t("scorecards.score", { score: overall_score?.toFixed(1) || "0.0" })}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {visibleSkills.map((skill, index) => (
          <span key={index} className="rounded-sm border border-brand-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
            {skill}
          </span>
        ))}
        {remainingSkillsCount > 0 && (
          <span className="bg-transparent px-2.5 py-1 text-xs font-medium text-text-muted">
            {t("scorecards.more", { count: remainingSkillsCount })}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-5">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Cpu size={14} strokeWidth={2} />
          {ai_model_name ? ai_model_name : t("scorecards.aiEvaluated")}
        </span>
        {/* Redirect to detailed scorecard page with the specific ID */}
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link to={`/employee/scorecard?id=${id}`} className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-brand-500 bg-brand-500 px-4 py-2 text-sm font-medium text-white no-underline transition-[background-color,color,border-color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-brand-600 hover:bg-brand-600 hover:text-white active:bg-brand-700">
            {t("scorecards.viewDetails")}
            <ArrowRight size={14} strokeWidth={2.5} className="rtl:-scale-x-100" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
