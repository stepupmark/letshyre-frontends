import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";
import { useRejectKyc } from "../mutations/use-review-kyc";
import { rejectKycSchema, type RejectKycInput } from "../schemas/kyc.schema";

type RejectKycDialogProps = {
  kycId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RejectKycDialog({
  kycId,
  companyName,
  open,
  onOpenChange,
}: RejectKycDialogProps) {
  const reject = useRejectKyc();
  const form = useForm<RejectKycInput>({
    resolver: zodResolver(rejectKycSchema),
    defaultValues: { remarks: "" },
  });
  const error = form.formState.errors.remarks;

  const handleOpenChange = (next: boolean) => {
    if (reject.isPending) return;
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ remarks }) =>
            reject.mutate(
              { id: kycId, remarks },
              { onSuccess: () => handleOpenChange(false) },
            ),
          )}
        >
          <DialogHeader>
            <DialogTitle>Reject {companyName}?</DialogTitle>
            <DialogDescription>
              The employer sees your remarks and can submit again.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(error)} className="py-4">
            <FieldLabel htmlFor="remarks">Remarks</FieldLabel>
            <Textarea
              id="remarks"
              rows={4}
              placeholder="e.g. The GST certificate is unreadable, please upload a clearer scan."
              aria-invalid={Boolean(error)}
              {...form.register("remarks")}
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
                disabled={reject.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={reject.isPending}
            >
              {reject.isPending && <LoaderCircle className="animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
