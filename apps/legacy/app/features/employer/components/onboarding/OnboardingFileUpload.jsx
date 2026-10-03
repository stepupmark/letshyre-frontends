import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FileText, FolderUp, CheckCircle2, Eye, Trash2, RefreshCw } from "lucide-react";
import { UPLOAD_RULES, uploadErrorKey } from "@/features/employer/schemas/onboarding.schema";
import { cn } from "@/lib/utils";

const formatBytes = (bytes) => {
  if (!+bytes) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${parseFloat((bytes / 1024 ** i).toFixed(2))} ${sizes[i]}`;
};

const ICON_BUTTON =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm border bg-card transition-colors duration-200 max-sm:size-11";

const UploadRow = ({ name, label, required, hint, kind, value, onChange, onPreview, error }) => {
  const { t } = useTranslation("onboarding");
  const [rejection, setRejection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [objectUrl, setObjectUrl] = useState(null);
  const rule = UPLOAD_RULES[kind];
  const shownError = rejection ?? error?.message;
  const isImage = !!value?.type?.startsWith("image/");
  const canView = isImage || value?.type === "application/pdf";
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;

  useEffect(() => {
    if (!value || !canView) return undefined;
    const url = URL.createObjectURL(value);
    // Browser resource that has to be created and revoked in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setObjectUrl(null);
    };
  }, [value, canView]);

  const accept = (file) => {
    if (!file) return;
    const errorKey = uploadErrorKey(file, kind);
    if (errorKey) {
      setRejection(t(errorKey));
      return;
    }
    setRejection(null);
    onChange(file);
  };

  const view = () => {
    if (!objectUrl) return;
    if (isImage && onPreview) onPreview(objectUrl);
    else window.open(objectUrl, "_blank", "noopener");
  };

  return (
    <div className="flex flex-col">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex min-h-20 items-center justify-between gap-4 rounded-md border-[1.5px] border-dashed border-border bg-bg-subtle px-5 py-4 transition-all duration-300 focus-within:border-brand-400 hover:border-brand-400 hover:bg-card hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.05)] max-sm:flex-col max-sm:items-stretch max-sm:px-4",
          dragging && "border-brand-600 bg-brand-100",
          shownError && "border-solid border-danger bg-danger-bg",
          value && !shownError && "border-solid border-success bg-success-bg",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-card shadow-[0_2px_4px_rgb(0_0_0_/_0.02)]",
              value && !shownError && "border-success/30",
            )}
          >
            {isImage && objectUrl ? (
              <img src={objectUrl} alt={t("form.upload.previewAlt")} className="size-full rounded-sm object-cover" decoding="async" />
            ) : value ? (
              <FileText size={24} className="text-brand-500" strokeWidth={1.5} />
            ) : (
              <FolderUp size={24} className="text-neutral-500" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-base font-semibold text-text-main">
              {label} {required && <span className="ms-0.5 text-danger" aria-hidden="true">*</span>}
            </span>
            {value ? (
              <span className="flex min-w-0 items-center gap-1 text-sm font-medium text-success">
                <CheckCircle2 size={14} className="shrink-0" />
                <span className="truncate" title={value.name}>{value.name}</span>
                <span className="shrink-0">· {formatBytes(value.size)}</span>
              </span>
            ) : (
              <span id={hintId} className="text-sm text-neutral-500">
                {hint} · {t(kind === "image" ? "form.upload.rulesImage" : "form.upload.rulesDocument")}
                <span className="max-sm:hidden"> · {t("form.upload.dropHint")}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 max-sm:justify-end">
          {value && canView && (
            <button
              type="button"
              className={cn(ICON_BUTTON, "border-brand-300 text-brand-600 hover:border-brand-500 hover:bg-brand-100")}
              onClick={view}
              aria-label={t("form.upload.viewFile")}
              title={t("form.upload.viewFile")}
            >
              <Eye size={16} />
            </button>
          )}
          {value && (
            <button
              type="button"
              className={cn(ICON_BUTTON, "border-danger/40 text-danger hover:border-danger hover:bg-danger-bg")}
              onClick={() => {
                setRejection(null);
                onChange(null);
              }}
              aria-label={t("form.upload.removeFile")}
              title={t("form.upload.removeFile")}
            >
              <Trash2 size={16} />
            </button>
          )}
          <label
            className={cn(
              "relative cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 has-[:focus-visible]:ring-offset-2",
              value
                ? cn(ICON_BUTTON, "border-border text-neutral-500 hover:border-neutral-400 hover:bg-bg-subtle")
                : "flex min-h-10 items-center justify-center rounded-sm bg-brand-500 px-5 py-2 text-sm font-semibold text-text-white transition-colors duration-200 hover:bg-brand-600 max-sm:min-h-11 max-sm:w-full",
            )}
            title={value ? t("form.upload.replaceFile") : undefined}
          >
            {value ? <RefreshCw size={16} aria-hidden="true" /> : t("form.upload.selectFile")}
            <input
              id={name}
              type="file"
              className="sr-only"
              accept={`${rule.extensions},${rule.types.join(",")}`}
              aria-label={value ? t("form.upload.replaceFile") : label}
              aria-invalid={!!shownError}
              aria-describedby={[value ? null : hintId, shownError ? errorId : null].filter(Boolean).join(" ") || undefined}
              onChange={(e) => {
                const file = e.target.files[0];
                // Cleared so picking the same file again after a rejection still fires.
                e.target.value = "";
                accept(file);
              }}
            />
          </label>
        </div>
      </div>
      {shownError && <span id={errorId} className="mt-1 ms-1 text-xs text-danger">{shownError}</span>}
    </div>
  );
};

export const FileUpload = ({ name, control, error, ...props }) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <UploadRow name={name} value={value} onChange={onChange} error={error} {...props} />
    )}
  />
);
