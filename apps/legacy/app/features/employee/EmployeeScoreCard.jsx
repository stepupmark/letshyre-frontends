import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useScorecardDetail } from "@/features/employee/hooks/useScorecardDetail";
import { useCandidateProfile } from "@/features/employee/hooks/useCandidateProfile";

import { ScorecardSkeleton } from "@/features/scorecard/components/ScorecardSkeleton";
import { ScorecardView } from "@/features/scorecard/components/ScorecardView";

function ScorecardEmpty() {
  const { t } = useTranslation("employee");
  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">
      <div className="rounded-md border border-danger bg-danger-bg px-5 py-4 text-center font-medium text-danger">
        {t("scorecards.detail.empty")}
      </div>
    </div>
  );
}

export function EmployeeScoreCard() {
  const { t } = useTranslation("employee");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError } = useScorecardDetail(id);
  const { data: userData } = useCandidateProfile();

  if (isLoading) {
    return <ScorecardSkeleton />;
  }

  const scorecard = data?.data;
  if (isError || !data?.success || !scorecard) {
    return <ScorecardEmpty />;
  }

  return (
    <ScorecardView
      scorecard={scorecard}
      photo={userData?.profile_photo}
      title={t("scorecards.detail.title")}
      subtitle={t("scorecards.detail.subtitle")}
    />
  );
}

export default EmployeeScoreCard;
