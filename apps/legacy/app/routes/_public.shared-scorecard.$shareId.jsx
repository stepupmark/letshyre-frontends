import { useParams } from "react-router";
import { preferredLocale } from "@/i18n/hooks";
import { seoT } from "@/i18n/i18n";
import { catalogLoader } from "@/loaders/catalogLoader";
import { useSharedScorecard, resolveShareError } from "@/features/scorecard-sharing/hooks/useSharedScorecard";
import { isValidShareId } from "@/lib/shareUrl";
import { SharedScorecardSkeleton } from "@/features/scorecard-sharing/components/SharedScorecardSkeleton";
import { ShareLinkUnavailable } from "@/features/scorecard-sharing/components/ShareLinkUnavailable";
import { SharedScorecardReport } from "@/features/scorecard-sharing/components/SharedScorecardReport";

export const handle = { i18n: ["sharedScorecard"] };
export const clientLoader = catalogLoader(handle.i18n);

// Client-rendered only, so no canonical/hreflang like the /:lang pages.
export const meta = () => {
  const t = seoT(preferredLocale());
  return [
    { title: t("sharedScorecard.title") },
    { name: "description", content: t("sharedScorecard.description") },
    // This URL exposes a named individual's interview results. It must never
    // be indexed, and the share id must never leak onward via the Referer header.
    { name: "robots", content: "noindex, nofollow" },
    { name: "referrer", content: "no-referrer" },
  ];
};

function SharedScorecardPage() {
  const { shareId } = useParams();
  const validId = isValidShareId(shareId);
  const { data, isLoading, isError, error, refetch } = useSharedScorecard(shareId);

  if (!validId) {
    return <ShareLinkUnavailable reason="invalid" />;
  }

  if (isLoading) {
    return <SharedScorecardSkeleton />;
  }

  if (isError) {
    const reason = resolveShareError(error);
    return <ShareLinkUnavailable reason={reason} onRetry={reason === "unavailable" ? refetch : undefined} />;
  }

  const payload = data?.data?.data;
  if (!payload) {
    return <ShareLinkUnavailable reason="unavailable" onRetry={refetch} />;
  }

  return <SharedScorecardReport data={payload} />;
}

export default function SharedScorecardRoute() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SharedScorecardPage />
    </div>
  );
}
