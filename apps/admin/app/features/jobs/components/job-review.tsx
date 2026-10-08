import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Check, LoaderCircle, X } from "lucide-react"
import { ConfirmDialog } from "~/components/feedback/confirm-dialog"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field"
import { Textarea } from "~/components/ui/textarea"
import { useJobAction } from "../mutations/use-job-action"
import {
  rejectJobsSchema,
  type ApprovalStatus,
  type RejectJobsInput,
} from "../schemas/jobs.schema"

function RejectDialog({
  jobIds,
  open,
  onOpenChange,
  onDone,
}: {
  jobIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}) {
  const action = useJobAction()
  const form = useForm<RejectJobsInput>({
    resolver: zodResolver(rejectJobsSchema),
    defaultValues: { reason: "" },
  })
  const error = form.formState.errors.reason
  const plural = jobIds.length > 1

  const handleOpenChange = (next: boolean) => {
    if (action.isPending) return
    if (!next) form.reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ reason }) =>
            action.mutate(
              { action: "reject", job_ids: jobIds, reason },
              {
                onSuccess: () => {
                  handleOpenChange(false)
                  onDone?.()
                },
              }
            )
          )}
        >
          <DialogHeader>
            <DialogTitle>
              Reject {plural ? `${jobIds.length} jobs` : "this job"}?
            </DialogTitle>
            <DialogDescription>
              The employer sees the reason and can edit the post.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(error)} className="py-4">
            <FieldLabel htmlFor="reject-reason">Reason</FieldLabel>
            <Textarea
              id="reject-reason"
              rows={4}
              aria-invalid={Boolean(error)}
              {...form.register("reason")}
            />
            {error ? (
              <FieldError errors={[error]} />
            ) : (
              <FieldDescription>
                Between 10 and 500 characters.
              </FieldDescription>
            )}
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={action.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={action.isPending}
            >
              {action.isPending && <LoaderCircle className="animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type JobReviewProps = {
  jobIds: string[]
  /** Hides actions that don't apply; bulk selections pass nothing. */
  approval?: ApprovalStatus
  size?: "sm" | "default"
  onDone?: () => void
}

export function JobReview({
  jobIds,
  approval,
  size = "default",
  onDone,
}: JobReviewProps) {
  const action = useJobAction()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const plural = jobIds.length > 1

  if (approval === "approved") return null

  return (
    <div className="flex gap-2">
      {approval !== "rejected" && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setRejectOpen(true)}
        >
          <X /> Reject
        </Button>
      )}
      <Button size={size} onClick={() => setApproveOpen(true)}>
        <Check /> Approve
      </Button>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${plural ? `${jobIds.length} jobs` : "this job"}?`}
        description="Approved jobs go live for candidates right away."
        confirmLabel="Approve"
        pending={action.isPending}
        onConfirm={() => {
          action.mutate({ action: "approve", job_ids: jobIds })
          setApproveOpen(false)
          onDone?.()
        }}
      />
      <RejectDialog
        jobIds={jobIds}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onDone={onDone}
      />
    </div>
  )
}
