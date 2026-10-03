import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyLinkButton({
  url,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  className,
}) {
  const { t } = useTranslation("employer");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("sharing.copy.toastSuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("sharing.copy.toastError"));
    }
  };

  const label = copied ? t("sharing.copy.copied") : t("sharing.copy.button");

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon-sm" : size}
      onClick={handleCopy}
      className={cn(!iconOnly && "gap-1.5", className)}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {!iconOnly && label}
    </Button>
  );
}
