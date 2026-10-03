import { useTranslation } from "react-i18next";
import { safeUrl } from "@/lib/safeUrl";
import { ShareProvenanceBar } from "@/features/scorecard-sharing/components/ShareProvenanceBar";
import { CandidateHeader } from "@/features/scorecard-sharing/components/CandidateHeader";
import { ScoreOverview } from "@/features/scorecard-sharing/components/ScoreOverview";
import { AiMatchCard } from "@/features/scorecard-sharing/components/AiMatchCard";
import { CommunicationMetrics } from "@/features/scorecard-sharing/components/CommunicationMetrics";
import { SectionPerformance } from "@/features/scorecard-sharing/components/SectionPerformance";
import { InsightsPanel } from "@/features/scorecard-sharing/components/InsightsPanel";
import { CandidateProfile } from "@/features/scorecard-sharing/components/CandidateProfile";
import { QuestionsAccordion } from "@/features/scorecard-sharing/components/QuestionsAccordion";
import { ReportToc } from "@/features/scorecard-sharing/components/ReportToc";

// Trailing unanswered / dummy-audio questions are dropped, same rule the
// employer scorecard view uses — an interview that ended early shouldn't
// read as a string of zero scores.
function trimTrailingUnanswered(questions) {
  const kept = [];
  for (const qa of questions) {
    if (qa.type === "AUDIO" && qa.is_dummy_audio) break;
    if (qa.type !== "AUDIO" && qa.answer_provided === "") break;
    kept.push(qa);
  }
  return kept;
}

export function SharedScorecardReport({ data }) {
  const { t } = useTranslation("sharedScorecard");

  const categoryScores = data.category_scores || {};
  const questions = trimTrailingUnanswered(categoryScores.question_breakdown || []);
  const interviewVideo = safeUrl(data.interview_video);

  const tocSections = [
    { id: "overview", label: t("toc.overview") },
    data.ai_match && { id: "ai-match", label: t("toc.aiMatch") },
    { id: "communication", label: t("toc.communication") },
    categoryScores.section_summary && { id: "sections", label: t("toc.sections") },
    { id: "insights", label: t("toc.insights") },
    { id: "profile", label: t("toc.profile") },
    { id: "questions", label: t("toc.questions") },
  ].filter(Boolean);

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8">
      <ReportToc sections={tocSections} />

      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-5">
        <ShareProvenanceBar companyName={data.shared_by_company_name} />

        <div id="overview" className="scroll-mt-24 rounded-lg border border-border-soft bg-card p-5 shadow-sm sm:p-6">
          <CandidateHeader
            name={data.candidate_name}
            role={data.candidate_role}
            photo={data.candidate_profile_photo}
            location={data.candidate_location}
            experienceYears={data.candidate_total_experience_years}
            matchedJobTitle={data.matched_job_title}
          />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <ScoreOverview score={data.overall_score} questionCount={questions.length} />
          <AiMatchCard aiMatch={data.ai_match} />
        </div>

        <CommunicationMetrics metrics={categoryScores.comm_metrics || {}} />

        <SectionPerformance sectionSummary={categoryScores.section_summary} />

        <InsightsPanel
          strengths={categoryScores.strengths}
          areasForImprovement={categoryScores.areas_for_improvement}
          recommendations={categoryScores.recommendations}
        />

        {interviewVideo && (
          <div id="interview" className="scroll-mt-24 rounded-lg border border-border-soft bg-card p-5 shadow-sm sm:p-6">
            <h2 className="m-0 mb-4 text-base font-bold text-text-main sm:text-lg">{t("interview.heading")}</h2>
            <video controls preload="none" src={interviewVideo} className="aspect-video w-full rounded-md bg-neutral-900">
              {t("interview.unsupported")}
            </video>
          </div>
        )}

        <CandidateProfile
          profile={{
            skills: data.candidate_skills,
            education: data.candidate_education,
            experience: data.candidate_experience,
            projects: data.candidate_projects,
            certifications: data.candidate_certifications,
            accomplishments: data.candidate_accomplishments,
            portfolioLinks: data.candidate_portfolio_links,
            resume: data.candidate_resume,
          }}
        />

        <QuestionsAccordion questions={questions} />
      </div>
    </div>
  );
}

export default SharedScorecardReport;
