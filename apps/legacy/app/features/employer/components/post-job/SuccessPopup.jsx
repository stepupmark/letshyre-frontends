import { CalendarCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import party from "@/assets/party.webp";
import check_mark from "@/assets/check-mark.webp";

export function SuccessPopup({ setShowSuccess }) {
  const navigate = useNavigate();
  const { t } = useTranslation("employerJobs");

  return (
    <Dialog open onOpenChange={(open) => !open && setShowSuccess(false)}>
      <DialogContent className="max-w-md overflow-hidden text-center">
        <img
          src={party}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-60"
        loading="lazy" decoding="async" />

        <div className="relative flex flex-col items-center gap-4">
          <img src={check_mark} alt="" className="size-16" loading="lazy" decoding="async" />

          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {t("postJob.success.title")}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              <Trans
                t={t}
                i18nKey="postJob.success.body"
                components={{ active: <strong className="font-semibold text-success" /> }}
              />
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full items-start gap-3 rounded-md bg-success-bg p-4 text-start">
            <CalendarCheck size={20} className="mt-1 shrink-0 text-success" />
            <div>
              <h5 className="font-semibold text-text-main">{t("postJob.success.whatsNext")}</h5>
              <p className="text-sm text-text-muted">
                {t("postJob.success.whatsNextBody")}
              </p>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => {
              setShowSuccess(false);
              navigate("/employer/view-jobs");
            }}
          >
            {t("postJob.success.continue")} <ArrowRight size={20} className="rtl:-scale-x-100" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
