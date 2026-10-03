import { useTranslation } from "react-i18next";
import { ScorecardHeader } from "@/features/scorecard/components/ScorecardHeader";
import { InterviewVideo } from "@/features/scorecard/components/InterviewVideo";
import { PerformanceSummary } from "@/features/scorecard/components/PerformanceSummary";
import { MetricsChart } from "@/features/scorecard/components/MetricsChart";
import { SkillsCard } from "@/features/scorecard/components/SkillsCard";
import { QuestionsBreakdown } from "@/features/scorecard/components/QuestionsBreakdown";

/**
 * The rendered scorecard, shared by the candidate's own view and the
 * employer's view of an unlocked candidate.
 *
 * The two pages differ only in how they fetch the data, their loading/error
 * states, and where the photo comes from — so that stays in the page
 * components. Everything downstream of a resolved scorecard (metric shaping,
 * the trailing-question trim, and the layout) lived in both files and now
 * lives here once.
 *
 * `title`/`subtitle` fall through to ScorecardHeader's employer defaults when
 * omitted; the candidate view passes first-person copy.
 */
export function ScorecardView({
  scorecard,
  photo,
  title,
  subtitle,
  showInterviewVideo = false,
  interviewVideoUrl,
}) {
  const { t } = useTranslation("scorecard");
  const {
    candidate_name,
    candidate_role,
    overall_score,
    created_at,
    candidate_skills,
    category_scores,
  } = scorecard;

  const commMetrics = category_scores?.comm_metrics || {};
  const questions = category_scores?.question_breakdown || [];

  /* Trim trailing unanswered / dummy-audio questions (same rule as before). */
  const displayQuestions = [];
  for (const qa of questions) {
    if (qa.type === "AUDIO" && qa.is_dummy_audio) break;
    if (qa.type !== "AUDIO" && qa.answer_provided === "") break;
    displayQuestions.push(qa);
  }

  const metrics = [
    { label: t("metrics.clarity"), value: commMetrics.clarity || 0 },
    { label: t("metrics.relevance"), value: commMetrics.relevance || 0 },
    { label: t("metrics.confidence"), value: commMetrics.confidence || 0 },
    { label: t("metrics.depth"), value: commMetrics.depth_of_thought || 0 },
    { label: t("metrics.keyConcept"), value: commMetrics.key_concept_coverage || 0 },
  ];

  const skills = candidate_skills || [];

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">
      <ScorecardHeader
        name={candidate_name}
        role={category_scores?.candidate_role || candidate_role}
        date={created_at}
        title={title}
        subtitle={subtitle}
      />

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[2.1fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <PerformanceSummary
            name={candidate_name}
            role={candidate_role}
            photo={photo}
            score={overall_score}
            questionCount={displayQuestions.length}
          />
          <MetricsChart metrics={metrics} />
        </div>
        <SkillsCard skills={skills} />
      </div>

      {/* Employer-only: the page opts in; InterviewVideo shows an empty state
          when no recording URL is present. */}
      {showInterviewVideo && <InterviewVideo url={interviewVideoUrl} />}

      <QuestionsBreakdown questions={displayQuestions} />
    </div>
  );
}

export default ScorecardView;
