import { AlertTriangle } from "lucide-react";
import { Modal } from "../../components/legacy-ui/modal/model2";
import Button from "../../components/legacy-ui/button/Button";
import { Gateway, useDeletePaymentGateway } from "../../hooks/usePaymentGateways";
import { toast } from "sonner";

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
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px] p-0 overflow-hidden rounded-2xl shadow-2xl"
    >
      <div className="relative px-6 pt-8 pb-6 text-center sm:px-8 sm:pt-10 sm:pb-8">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-destructive/10 via-background to-background opacity-90"></div>

        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-destructive/10 animate-ping opacity-50 duration-1000"></div>
            <div className="relative flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full ring-8 ring-destructive/20 shadow-xs">
              <AlertTriangle
                className="w-8 h-8 text-destructive"
                strokeWidth={1.75}
              />
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">
            Delete Payment Gateway?
          </h3>

          <div className="mb-8 text-sm leading-relaxed text-muted-foreground">
            <p>You are about to permanently delete this payment gateway:</p>
            <div className="inline-block px-4 py-2 mt-3 mb-3 font-mono text-base font-bold tracking-widest text-destructive bg-destructive/10 border border-destructive/50 border-dashed rounded-lg shadow-xs">
              {gateway.displayName}
            </div>
            <p className="text-xs font-medium text-destructive">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex w-full gap-3 mt-2">
          <Button
            variant="outline"
            className="w-1/2 py-2.5 font-medium border-border hover:bg-accent text-foreground transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            className="w-1/2 py-2.5 font-medium bg-destructive hover:bg-destructive/90 text-white border-transparent shadow-md shadow-destructive/20 transition-all active:scale-[0.98]"
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
