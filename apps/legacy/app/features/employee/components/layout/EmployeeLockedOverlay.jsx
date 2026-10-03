import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import overlay_img from "@/assets/unlock-img.webp";

function EmployeeLockedOverlay({ onAction }) {
  const { t } = useTranslation("dashboard");
  return (
    <Dialog open>
      <DialogContent
        className="mx-0.5 w-full max-w-md gap-0 overflow-hidden p-0"
        overlayClassName="bg-text-main/30"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <img
          src={overlay_img}
          alt=""
          className="w-full rounded-t-xl"
          loading="lazy"
          decoding="async"
        />

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-brand-700 font-bold text-center w-full">
              {t("locked.title")}
            </DialogTitle>
            <DialogDescription className="font-semibold text-text-body text-center w-full">
              {t("locked.description")}
            </DialogDescription>
          </DialogHeader>

          <Button
            className="flex mx-auto mt-4 gap-2 shadow-brand "
            onClick={onAction}
          >
            <span>{t("locked.action")}</span>
            <ArrowRight size={20} className="rtl:-scale-x-100" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EmployeeLockedOverlay;
