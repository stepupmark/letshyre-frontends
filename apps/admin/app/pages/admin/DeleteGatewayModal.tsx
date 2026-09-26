import { AlertTriangle } from "lucide-react";
import { Modal } from "../../components/legacy-ui/modal/model2";
import Button from "../../components/legacy-ui/button/Button";
import {
  Gateway,
  useDeletePaymentGateway,
} from "../../hooks/usePaymentGateways";
import { toast } from "sonner";
import { getErrorMessage } from "~/lib/api/api-error";

interface DeleteGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: Gateway | null;
}

export default function DeleteGatewayModal({
  isOpen,
  onClose,
  gateway,
}: DeleteGatewayModalProps) {
  const { mutate: deleteMutate, isPending: isDeleting } =
    useDeletePaymentGateway();

  if (!gateway) return null;

  const handleDelete = () => {
    deleteMutate(gateway.id, {
      onSuccess: () => {
        toast.success("Payment Gateway deleted successfully");
        onClose();
      },
      onError: (error: Error) => {
        toast.error(getErrorMessage(error, "Something went wrong"));
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px] overflow-hidden rounded-2xl p-0 shadow-2xl"
    >
      <div className="relative px-6 pt-8 pb-6 text-center sm:px-8 sm:pt-10 sm:pb-8">
        <div className="absolute top-0 left-0 h-32 w-full bg-linear-to-b from-destructive/10 via-background to-background opacity-90"></div>

        <div className="relative flex flex-col items-center">
          <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/10 opacity-50 duration-1000"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 shadow-xs ring-8 ring-destructive/20">
              <AlertTriangle
                className="h-8 w-8 text-destructive"
                strokeWidth={1.75}
              />
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">
            Delete Payment Gateway?
          </h3>

          <div className="mb-8 text-sm leading-relaxed text-muted-foreground">
            <p>You are about to permanently delete this payment gateway:</p>
            <div className="mt-3 mb-3 inline-block rounded-lg border border-dashed border-destructive/50 bg-destructive/10 px-4 py-2 font-mono text-base font-bold tracking-widest text-destructive shadow-xs">
              {gateway.displayName}
            </div>
            <p className="text-xs font-medium text-destructive">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-2 flex w-full gap-3">
          <Button
            variant="outline"
            className="w-1/2 border-border py-2.5 font-medium text-foreground transition-colors hover:bg-accent"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            className="w-1/2 border-transparent bg-destructive py-2.5 font-medium text-white shadow-md shadow-destructive/20 transition-all hover:bg-destructive/90 active:scale-[0.98]"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
