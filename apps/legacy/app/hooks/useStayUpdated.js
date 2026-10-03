import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { subscribeToNewsletter } from "@/services/newsletter.service";
import { toast } from "@/lib/toast";

export const useStayUpdated = () => {
  const { t } = useTranslation("common");
  return useMutation({
    mutationFn: (email) => subscribeToNewsletter(email),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data.message || t("newsletter.subscribed"));
      } else {
        toast.error(data?.message || t("toast.genericError"));
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("newsletter.subscribeFailed"),
      );
    },
  });
};
