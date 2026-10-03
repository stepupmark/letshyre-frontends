import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { submitContactEnquiry } from "@/features/contact/services/contact.service";

export const useContactMutation = () => {
  const { t } = useTranslation("contact");
  const { t: tCommon } = useTranslation("common");
  return useMutation({
    mutationFn: submitContactEnquiry,
    onSuccess: (data) => {
      toast.success(data?.message || t("form.successTitle"));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || tCommon("toast.genericError"),
      );
    },
  });
};
