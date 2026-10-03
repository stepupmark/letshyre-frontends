import { useSearchParams } from "react-router";
import { FileQuestion } from "lucide-react";

import { useUnlockedCandidateScorecard } from "@/features/employer/hooks/useUnlockedCandidateScorecard";

import { ScorecardSkeleton } from "@/features/scorecard/components/ScorecardSkeleton";
import { ScorecardView } from "@/features/scorecard/components/ScorecardView";
import { Card, CardContent } from "@/components/ui/card";

function ScorecardError({ message }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 py-20">
      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <FileQuestion size={24} />
          </div>
          <p className="text-base font-medium text-neutral-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmployeeScoreCard() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: responseData,
    isLoading,
    isError,
  } = useUnlockedCandidateScorecard(id);

  if (!id) {
    return <ScorecardError message="No candidate found." />;
  }

  if (isLoading) {
    return <ScorecardSkeleton showInterviewVideo />;
  }

  if (isError || !responseData?.data) {
    return (
      <ScorecardError message="Failed to load the scorecard. It may not be generated yet, or the ID is invalid." />
    );
  }

  const scData = responseData.data;

  return (
    <ScorecardView
      scorecard={scData}
      photo={scData.candidate_profile_photo}
      showInterviewVideo
      interviewVideoUrl={scData.candidate_interview_video}
    />
  );
}

export default EmployeeScoreCard;
