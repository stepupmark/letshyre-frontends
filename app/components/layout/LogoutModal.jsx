import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import logoutImg from "@/assets/logout.webp";

/**
 * Confirm-before-logout dialog, shared by both dashboard layouts.
 *
 * Until now the employer layout carried its own inline copy of this markup
 * (EmployerDashboardLayout.jsx), and the two dashboards' stylesheets each
 * defined `.logout-modal` differently — so the same component rendered as two
 * different designs depending on which route loaded. Both stylesheets are gone
 * and this is now the single implementation; the employer treatment won,
 * because destructive-red confirm buttons match what the action does.
 */
const LogoutModal = ({ isOpen, onClose, onConfirm, isLoggingOut }) => {
  const { t } = useTranslation("dashboard");
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md gap-0 overflow-hidden p-0"
        overlayClassName="bg-text-main/60 backdrop-blur-xs"
        showCloseButton={false}
      >
        <DialogClose
          className="absolute top-4 end-4 z-10 flex size-8 items-center justify-center rounded-full bg-card text-neutral-500 shadow-md transition hover:scale-105 hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={t("logout.closeAria")}
        >
          <X size={20} />
        </DialogClose>

        <img
          src={logoutImg}
          alt=""
          className="h-50 w-full border-b border-border-soft object-cover"
        loading="lazy" decoding="async" />

        <DialogHeader className="px-8 pt-6 text-center sm:text-center">
          <DialogTitle className="text-xl text-neutral-800">
            {t("logout.title")}
          </DialogTitle>
          <DialogDescription className="text-base text-neutral-500">
            {t("logout.confirm")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3 p-8">
          {/* Colours kept as the employer layout had them: a soft danger wash
              with danger-coloured text, not shadcn's solid destructive fill. */}
          <Button
            variant="secondary"
            className="flex-1 bg-neutral-100 text-text-muted hover:bg-border hover:text-neutral-800"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            {t("logout.cancel")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-danger-bg text-danger hover:bg-danger-bg"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("logout.loggingOut") : t("logout.confirmButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
