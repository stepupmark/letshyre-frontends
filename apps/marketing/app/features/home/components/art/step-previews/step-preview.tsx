import {
  HirePreview,
  PostPreview,
  RankedPreview,
  ReviewPreview,
  UnlockPreview,
} from "./employer-previews"
import {
  InterviewPreview,
  MatchPreview,
  ProfilePreview,
  ResumePreview,
  ScorecardPreview,
} from "./professional-previews"

const PREVIEWS = {
  employers: [
    PostPreview,
    RankedPreview,
    ReviewPreview,
    UnlockPreview,
    HirePreview,
  ],
  professionals: [
    ProfilePreview,
    ResumePreview,
    InterviewPreview,
    ScorecardPreview,
    MatchPreview,
  ],
}

/** The small screen for one step; loaded after hydration. */
export default function StepPreview({
  side,
  index,
}: {
  side: keyof typeof PREVIEWS
  index: number
}) {
  const Preview = PREVIEWS[side][index]
  return Preview ? <Preview /> : null
}
