import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateInterviews } from "@/features/employer/hooks/useCandidatePool";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const UNLOCKED_BADGE =
  "rounded-md border-transparent bg-success-bg px-2 py-0.75 text-xs font-semibold tracking-wide text-success";

const UP_SCORE_BADGE =
  "rounded-sm border-brand-300 bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-600";

const UP_MODAL =
  "relative w-full max-w-130 animate-slide-up rounded-lg bg-card p-8 shadow-xl motion-reduce:animate-none max-sm:px-5 max-sm:py-6";
const UP_CLOSE =
  "absolute top-5 end-5 flex items-center justify-center rounded-full bg-transparent p-2 text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-text-body";
const UP_TITLE =
  "mt-0 mb-3 text-center text-2xl font-bold tracking-tight text-brand-600";
const UP_SUBTITLE =
  "mt-0 mb-7 text-center text-base font-medium text-neutral-700";
const UP_PRIMARY_BOX =
  "mb-7 flex items-center justify-between rounded-md border border-brand-300 bg-card px-5 py-4 shadow-sm";
const UP_PRIMARY_INFO = "flex items-center gap-4";
const HO_AVATAR =
  "flex shrink-0 items-center justify-center rounded-md bg-neutral-100 text-base font-semibold text-text-white";
const UP_C_NAME = "mt-0 mb-1 text-base font-semibold text-text-body";
const UP_C_ROLE = "m-0 flex items-center gap-2 text-sm text-text-muted";
const HO_CODE_ICON = "font-bold tracking-tighter text-brand-600";
const UP_EXTRA_LABEL = "mt-0 mb-3 text-base font-medium text-neutral-700";
const UP_EXTRA_BOX =
  "mb-7 overflow-hidden rounded-md border border-brand-300 bg-card";
const UP_EXTRA_ROW =
  "flex items-center justify-between border-b border-border px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-bg-subtle";
const UP_FOOTER =
  "mt-8 flex items-end justify-between max-sm:flex-col max-sm:items-stretch max-sm:gap-4";
const UP_FOOTER_TEXT =
  "m-0 text-sm leading-normal text-text-muted max-sm:text-center";

const UNLOCK_CHECKBOX =
  "size-5.5 rounded-sm border-2 border-neutral-300 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600";

export default function UnlockProfileModal({
  candidate,
  onClose,
  onUnlock,
  isUnlocking,
}) {
  const { t } = useTranslation("employerCandidates");
  // Extract primary role from the candidate data
  const primary = candidate.roles[0];

  // Fetch candidate's past interview scores dynamically
  const { data: extrasData = [], isLoading } = useCandidateInterviews(
    candidate.id,
  );

  // Split out the primary-role interview (matched by role + rounded score) and
  // keep at most two of the rest, in one pass.
  const { displayExtras, primaryInterviewData } = useMemo(() => {
    let matched = null;
    const rest = [];

    for (const ex of extrasData) {
      if (
        !matched &&
        ex.role === primary?.role &&
        Math.round(ex.score) === primary?.score
      ) {
        matched = ex;
        continue;
      }
      rest.push(ex);
    }

    return { displayExtras: rest.slice(0, 2), primaryInterviewData: matched };
  }, [extrasData, primary?.role, primary?.score]);

  // Track which interviews are checked (stores interview_id)
  const [selectedInterviews, setSelectedInterviews] = useState([]);

  const handleToggle = (interviewId, isUnlocked) => {
    if (!interviewId || isUnlocked) return; // Prevent checking if already unlocked or invalid
    setSelectedInterviews((prev) =>
      prev.includes(interviewId)
        ? prev.filter((id) => id !== interviewId)
        : [...prev, interviewId],
    );
  };

  // Dynamically calculate credits: 1 for each checked interview
  const totalCredits = selectedInterviews.length;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none"
        overlayClassName="bg-text-main/40 backdrop-blur-xs"
        showCloseButton={false}
      >
        {/* Modal animates transform, which would fight Radix's translate-based
            centring, so it lives on an inner element. */}
        <div className={UP_MODAL}>
          <DialogClose className={UP_CLOSE} aria-label={t("pool.unlockModal.close")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              width="16"
              height="16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </DialogClose>

          <DialogTitle asChild>
            <h2 className={UP_TITLE}>{t("pool.unlockModal.title")}</h2>
          </DialogTitle>
          <DialogDescription asChild>
            <p className={UP_SUBTITLE}>
              {t("pool.unlockModal.subtitle", {
                name: candidate.name,
                count: totalCredits,
              })}
            </p>
          </DialogDescription>

        {/* Primary Role Box */}
        <div className={UP_PRIMARY_BOX}>
          <div className={UP_PRIMARY_INFO}>
            {/* background stays inline — it comes from the candidate record. */}
            <div
              className={cn(HO_AVATAR, "size-10.5 overflow-hidden")}
              style={{
                background: candidate.profile_photo_url
                  ? "transparent"
                  : candidate.avatarBg || "#1e293b",
              }}
            >
              {candidate.profile_photo_url ? (
                <img
                  src={candidate.profile_photo_url}
                  alt={candidate.name}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                loading="lazy" decoding="async" />
              ) : null}
              {/* onError shows this via inline display:flex (beats `hidden`), so
                  a dead photo URL falls back to initials. */}
              <div
                className={cn(
                  "flex size-full items-center justify-center",
                  candidate.profile_photo_url && "hidden",
                )}
              >
                {candidate.avatar}
              </div>
            </div>
            <div>
              <p className={UP_C_NAME}>{candidate.name}</p>
              <p className={UP_C_ROLE}>
                <span className={HO_CODE_ICON}>&lt;/&gt;</span> {primary.role}
                {/* Main Highlighted Score */}
                <Badge variant="outline" className={UP_SCORE_BADGE}>{primary.score}%</Badge>
              </p>
            </div>
          </div>
          {/* Primary checkbox */}
          <div className="flex items-center gap-2">
            {primaryInterviewData?.unlocked && (
              <Badge className={UNLOCKED_BADGE}>{t("pool.unlockModal.unlocked")}</Badge>
            )}
            <Checkbox
              className={UNLOCK_CHECKBOX}
              checked={
                !!primaryInterviewData?.interview_id &&
                selectedInterviews.includes(primaryInterviewData.interview_id)
              }
              disabled={!primaryInterviewData || primaryInterviewData.unlocked}
              onCheckedChange={() =>
                handleToggle(
                  primaryInterviewData?.interview_id,
                  primaryInterviewData?.unlocked,
                )
              }
            />
          </div>
        </div>

        {/* Extra Roles Box (Only shows if candidate applied for multiple roles) */}
        {isLoading ? (
          <div className={cn(UP_EXTRA_BOX, "flex justify-center p-4")}>
            <span className="text-sm text-neutral-500">
              {t("pool.unlockModal.loadingInterviews")}
            </span>
          </div>
        ) : displayExtras.length > 0 ? (
          <>
            <p className={UP_EXTRA_LABEL}>
              {t("pool.unlockModal.otherInterviews")}
            </p>
            <div className={UP_EXTRA_BOX}>
              {displayExtras.map((ex) => (
                <div
                  key={ex.interview_id}
                  className={cn(
                    UP_EXTRA_ROW,
                    ex.unlocked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                  onClick={() => handleToggle(ex.interview_id, ex.unlocked)}
                >
                  <p className={UP_C_ROLE}>
                    <span className={HO_CODE_ICON}>&lt;/&gt;</span> {ex.role}
                    {/* Muted Sub-Score */}
                    <span className="text-sm font-semibold text-danger">{ex.score}%</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {ex.unlocked && (
                      <Badge className={UNLOCKED_BADGE}>{t("pool.unlockModal.unlocked")}</Badge>
                    )}
                    <Checkbox
                      className={UNLOCK_CHECKBOX}
                      checked={selectedInterviews.includes(ex.interview_id)}
                      disabled={ex.unlocked}
                      onCheckedChange={() =>
                        handleToggle(ex.interview_id, ex.unlocked)
                      }
                      onClick={(e) => e.stopPropagation()} // Prevent bubble to row so it doesn't toggle twice
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className={UP_FOOTER}>
          <p className={UP_FOOTER_TEXT}>
            {t("pool.unlockModal.footerText")}
          </p>
          <Button
            className="h-auto rounded-sm bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-px hover:bg-neutral-900 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:hover:translate-y-0"
            onClick={() => {
              if (onUnlock) {
                // Pass the selected interviews array
                onUnlock(candidate.id, selectedInterviews, totalCredits);
              } else onClose();
            }}
            disabled={isUnlocking || totalCredits === 0}
          >
            {isUnlocking
              ? t("pool.unlockModal.unlocking")
              : t("pool.unlockModal.unlockFor", { count: totalCredits })}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
