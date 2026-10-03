import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteShareLink } from "@/features/employer/hooks/useSharedLinks";

export function DeleteShareLinkDialog({ link, open, onOpenChange }) {
  const { t } = useTranslation("sharedLinks");
  const { mutate: deleteLink, isPending } = useDeleteShareLink();

  const handleConfirm = () => {
    deleteLink(link.id, {
      onSuccess: () => {
        toast.success(t("toasts.deleted"));
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || t("toasts.deleteFailed"));
      },
    });
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-sm">
        <DialogHeader className="gap-3">
          <div className="mx-auto mb-1 flex size-11 items-center justify-center rounded-full bg-danger-bg text-danger">
            <Trash2 size={20} aria-hidden="true" />
          </div>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("deleteDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
