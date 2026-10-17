import {
  HireScene,
  PostScene,
  RankScene,
  ReviewScene,
  UnlockScene,
} from "./employer-steps"
import {
  InterviewScene,
  MatchScene,
  ProfileScene,
  ResumeScene,
  ScorecardScene,
} from "./professional-steps"

const SCENES = {
  employers: [PostScene, RankScene, ReviewScene, UnlockScene, HireScene],
  professionals: [
    ProfileScene,
    ResumeScene,
    InterviewScene,
    ScorecardScene,
    MatchScene,
  ],
}

export default function StepScene({
  side,
  index,
}: {
  side: keyof typeof SCENES
  index: number
}) {
  const Scene = SCENES[side][index]
  return Scene ? <Scene /> : null
}
