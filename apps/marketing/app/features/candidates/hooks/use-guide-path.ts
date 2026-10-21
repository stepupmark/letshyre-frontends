import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

/** The interview guide is retiring into the candidate guide, locale by locale. */
export function useGuidePath() {
  const published = usePublished()
  return published("candidateGuide")
    ? PAGES.candidateGuide.path
    : PAGES.interview.path
}
