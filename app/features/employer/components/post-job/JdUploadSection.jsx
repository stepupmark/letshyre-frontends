import React from "react";
import {
  FileText,
  CheckCircle2,
  Eye,
  RefreshCw,
  Briefcase,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  Upload,
  Cpu,
  Timer,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import upload_img from "@/assets/jd-drag-drop.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

/** Selected at runtime per feature card, so it stays a lookup map. */
const JD_FEATURE_ICON_TONE = {
  purple: "bg-brand-200 text-brand-800",
  blue: "bg-brand-100 text-brand-600",
};

// Side padding leaves room for the icons absolutely positioned inside the field.
const JD_TITLE_INPUT =
  "h-auto w-full rounded-md border border-border px-11 py-3.5 text-base md:text-base text-text-main shadow-none focus-visible:border-border-focus focus-visible:ring-0";

const FILE_ACTION_CLASS =
  "h-auto gap-2 rounded-md border-border bg-card px-5 py-2.5 text-sm font-medium text-text-body hover:border-text-muted hover:bg-bg-subtle hover:text-text-body";

// flex-col because it stacks a title over a subtitle (the Button primitive is row by default).
const ANALYZE_CLASS =
  "h-auto w-full flex-col gap-1 rounded-md bg-brand-600 p-4 text-lg font-semibold text-white transition-all hover:bg-brand-600 hover:brightness-110 active:scale-98 disabled:opacity-70 motion-reduce:active:scale-100";

export function JdUploadSection({
  fileName,
  jdJobTitle,
  setJdJobTitle,
  handleClick,
  handleJdUpload,
  isPending,
  fileInputRef,
  handleFileChange,
  selectedFile,
}) {
  const { t } = useTranslation("employerJobs");
  const handleViewFile = () => {
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div>
      {fileName ? (
        <div className="mx-auto my-6 max-w-150 overflow-hidden rounded-lg border border-border bg-card shadow-lg max-sm:m-2">
          {/* Top Section: File Info & Actions */}
          <div className="flex flex-col items-center bg-bg-subtle p-6 text-center">
            <div className="mb-5 flex flex-col items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-md bg-card shadow-md">
                <FileText size={32} className="text-danger" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold break-all text-text-main" title={fileName}>
                  {fileName}
                </span>
                <span className="text-sm text-text-muted">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : t("postJob.upload.file")}{" "}
                  • {t("postJob.upload.uploadedJustNow")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 size={12} /> {t("postJob.upload.readyForAnalysis")}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={FILE_ACTION_CLASS}
                onClick={handleViewFile}
                title={t("postJob.upload.viewFile")}
              >
                <Eye size={16} /> {t("postJob.upload.viewFile")}
              </Button>
              <Button
                variant="outline"
                className={FILE_ACTION_CLASS}
                onClick={handleClick}
                disabled={isPending}
                title={t("postJob.upload.replaceFile")}
              >
                <RefreshCw size={16} /> {t("postJob.upload.replaceFile")}
              </Button>
            </div>
          </div>

          <hr className="m-0 border-0 border-t border-dashed border-border" />

          {/* Middle Section: Job Title Input */}
          <div className="p-6">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-text-main">{t("postJob.upload.confirmTitle")}</label>
              <p className="mt-0 mb-3 text-sm text-text-muted">
                {t("postJob.upload.confirmHelp")}
              </p>
              <div className="relative flex items-center">
                <Briefcase className="absolute start-4 text-brand-500" size={18} />
                <Input
                  type="text"
                  placeholder={t("postJob.upload.titlePlaceholder")}
                  value={jdJobTitle}
                  onChange={(e) => setJdJobTitle(e.target.value)}
                  className={JD_TITLE_INPUT}
                />
                {jdJobTitle.trim() && (
                  <Check className="absolute end-4 text-success" size={18} />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Primary Action */}
          <div className="px-6 pb-6">
            <Button
              className={ANALYZE_CLASS}
              onClick={handleJdUpload}
              disabled={isPending || !jdJobTitle.trim()}
            >
              {isPending ? (
                <span className="flex items-center gap-2 font-semibold animate-pulse-text motion-reduce:animate-none">
                  <RefreshCw size={16} className="animate-spin" />
                  {t("postJob.upload.extracting")}
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} /> {t("postJob.upload.analyze")}
                  </div>
                  <span className="text-xs font-normal opacity-90">
                    {t("postJob.upload.analyzeHint")}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Optional info banner, kept for reference:

          <div className="flex items-center justify-between border-b border-border-soft bg-brand-100 px-5 py-3 max-md:flex-col max-md:items-start max-md:gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-600">
              <Info size={16} />
              <span>
                Upload a JD file and we'll help you create a compelling job post
                in seconds.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <ShieldCheck size={16} />
              <span>Your data is secure and private</span>
            </div>
          </div> */}

          <div className="m-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-bg-page px-6 py-12 text-center transition-[transform,border-color,background-color] duration-250 hover:border-brand-400 hover:bg-brand-100 max-sm:px-4 max-sm:py-8" onClick={handleClick}>
            <img
              src={upload_img}
              alt={t("postJob.upload.folderAlt")}
              className="pointer-events-none mb-6 w-55"
            loading="lazy" decoding="async" />
            <h3 className="mb-2 text-lg font-semibold text-brand-600">{t("postJob.upload.dropTitle")}</h3>
            <span className="mb-4 text-sm text-text-faint">{t("postJob.upload.or")}</span>
            <Button className="mb-4 h-auto gap-2 rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-brand-600 hover:brightness-110 active:scale-97 motion-reduce:active:scale-100">
              <Upload size={18} /> {t("postJob.upload.chooseFile")}
            </Button>
            <span className="text-sm text-text-muted">
              {t("postJob.upload.supports")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-border bg-bg-subtle p-6 max-lg:grid-cols-2 max-md:grid-cols-1">
            <div className="flex items-start gap-3">
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", JD_FEATURE_ICON_TONE.purple)}>
                <Cpu size={24} />
              </div>
              <div>
                <h4 className="mt-0 mb-1 text-base font-semibold text-text-main">{t("postJob.upload.features.parsingTitle")}</h4>
                <p className="m-0 text-sm leading-snug text-text-muted">
                  {t("postJob.upload.features.parsingBody")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", JD_FEATURE_ICON_TONE.blue)}>
                <Timer size={24} />
              </div>
              <div>
                <h4 className="mt-0 mb-1 text-base font-semibold text-text-main">{t("postJob.upload.features.timeTitle")}</h4>
                <p className="m-0 text-sm leading-snug text-text-muted">{t("postJob.upload.features.timeBody")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", JD_FEATURE_ICON_TONE.purple)}>
                <Target size={24} />
              </div>
              <div>
                <h4 className="mt-0 mb-1 text-base font-semibold text-text-main">{t("postJob.upload.features.matchesTitle")}</h4>
                <p className="m-0 text-sm leading-snug text-text-muted">{t("postJob.upload.features.matchesBody")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />
    </div>
  );
}
