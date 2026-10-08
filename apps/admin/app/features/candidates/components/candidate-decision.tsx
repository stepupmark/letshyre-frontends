import { useState } from "react"
import { Check, X } from "lucide-react"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@workspace/ui/components/button"
import { useCandidateDecision } from "../mutations/use-candidate-decision"
import type {
  CandidateDecision as Decision,
  CandidateProfile,
} from "../schemas/candidates.schema"

const COPY: Record<
  Decision,
  { title: string; description: string; confirm: string }
> = {
  approve: {
    title: "Approve this candidate?",
    description: "Employers can find and unlock their profile.",
    confirm: "Approve",
  },
  reject: {
    title: "Reject this candidate?",
    description:
      "Their profile is hidden from employers. You can approve it later.",
    confirm: "Reject",
  },
}

export function CandidateDecision({ profile }: { profile: CandidateProfile }) {
  const decide = useCandidateDecision(profile.id)
  const [pending, setPending] = useState<Decision>("approve")
  const [open, setOpen] = useState(false)

  const ask = (decision: Decision) => {
    setPending(decision)
    setOpen(true)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {profile.is_approved ? (
        <StatusBadge tone="success">Approved</StatusBadge>
      ) : profile.is_rejected ? (
        <>
          <StatusBadge tone="danger">Rejected</StatusBadge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              ask("approve")
            }}
          >
            <Check /> Approve instead
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => {
              ask("reject")
            }}
          >
            <X /> Reject
          </Button>
          <Button
            onClick={() => {
              ask("approve")
            }}
          >
            <Check /> Approve
          </Button>
        </>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={COPY[pending].title}
        description={COPY[pending].description}
        confirmLabel={COPY[pending].confirm}
        destructive={pending === "reject"}
        pending={decide.isPending}
        onConfirm={() => {
          decide.mutate(pending, {
            onSuccess: () => {
              setOpen(false)
            },
          })
        }}
      />
    </div>
  )
}
