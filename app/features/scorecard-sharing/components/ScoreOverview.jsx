import { useTranslation } from "react-i18next";
import sc_bg from "@/assets/scorecard-bg.webp";
import { roundScore } from "@/features/scorecard-sharing/components/shareFormat";

/** Hero tile for the overall interview score — the first number a reader sees. */
export function ScoreOverview({ score, questionCount }) {
  const { t } = useTranslation("sharedScorecard");
  const pct = roundScore(score);

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-text-white shadow-sm sm:p-7">
      <div className="text-5xl leading-none font-bold sm:text-6xl">{pct}%</div>
      <div className="mt-3 text-lg font-semibold text-text-white/92">{t("overview.overallScore")}</div>
      <p className="mt-2 mb-0 text-sm text-text-white/80">
        {t("overview.basedOn", { count: questionCount })}
      </p>
      <div className="pointer-events-none absolute -top-5 -end-12.5 size-47.5 opacity-90 [&_img]:w-full" aria-hidden="true">
        <img src={sc_bg} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

export default ScoreOverview;
