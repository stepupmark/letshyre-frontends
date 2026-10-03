import React, { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CloudUpload, Camera, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACTIONS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  ERROR_MSG,
} from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";

const UPLOAD_CARD =
  "relative flex h-42.5 w-52.5 cursor-pointer flex-col items-center justify-center rounded-md border border-border bg-card shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] motion-reduce:hover:translate-y-0";

const UPLOAD_ICON = "mb-4 flex size-16 items-center justify-center rounded-lg";

const CARD_TITLE = "font-semibold text-base text-text-main";

const CARD_HINT = "mt-1 text-sm text-neutral-500";

// Circle with a white ring, shared by the preview and the live camera.
const CIRCLE_MEDIA =
  "size-70 rounded-full border-6 border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]";

function StepPhoto({ onNext, onBack }) {
  const { t } = useTranslation("employeeOnboarding");
  const { setValue, watch } = useFormContext();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const profilePhoto = watch("profile_photo");

  useEffect(() => {
    if (profilePhoto && typeof profilePhoto !== "string") {
      const url = URL.createObjectURL(profilePhoto);
      // Object URL creation is an imperative browser-API side effect that must
      // run in an effect (and be revoked in cleanup) — not derivable at render time.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof profilePhoto === "string") {
      setPreviewUrl(profilePhoto);
    }
  }, [profilePhoto]);

  const openCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(media);
      setCameraOn(true);
    } catch {
      setPhotoError(t("photo.cameraUnavailable"));
    }
  };

  useEffect(() => {
    if (cameraOn && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "profile_photo.png", { type: "image/png" });
      setValue("profile_photo", file);
      setPhotoError("");
    }, "image/png");
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError(t("photo.invalidImage"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError(t("photo.maxSize"));
      return;
    }
    setValue("profile_photo", file);
    setPhotoError("");
  };

  const handleContinue = () => {
    if (!profilePhoto) {
      setPhotoError(t("photo.required"));
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-6 text-start">
        <h3 className="mb-2 text-xl font-semibold text-text-main">{t("photo.heading")}</h3>
        <p className="text-sm text-neutral-500">
          {t("photo.subtitle")}
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 bg-card p-8 text-center">
        {!cameraOn && !profilePhoto && (
          <div className="flex flex-wrap justify-center gap-6">
            <div
              className={cn(UPLOAD_CARD, "border-[1.5px] border-brand-600")}
              onClick={() => fileInputRef.current.click()}
            >
              <CheckCircle2
                size={24}
                className="absolute -top-2.5 -end-2.5 rounded-full bg-white text-brand-600"
                strokeWidth={3}
                fill="#ffffff"
              />
              <div className={cn(UPLOAD_ICON, "bg-brand-100 text-brand-600")}>
                <CloudUpload size={32} />
              </div>
              <div className={CARD_TITLE}>{t("photo.uploadTitle")}</div>
              <div className={CARD_HINT}>{t("photo.uploadHint")}</div>
            </div>

            <div className={UPLOAD_CARD} onClick={openCamera}>
              <div className={cn(UPLOAD_ICON, "bg-bg-subtle text-text-main")}>
                <Camera size={32} />
              </div>
              <div className={CARD_TITLE}>{t("photo.selfieTitle")}</div>
              <div className={CARD_HINT}>{t("photo.selfieHint")}</div>
            </div>

            <input
              hidden
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}

        {cameraOn && (
          <div className="flex flex-col items-center gap-5">
            <div className={cn(CIRCLE_MEDIA, "relative mx-auto overflow-hidden bg-neutral-100")}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="size-full -scale-x-100 object-cover"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button type="button" className={BTN_SECONDARY} onClick={stopCamera}>
                {t("photo.cancel")}
              </Button>
              <Button className={BTN_PRIMARY} onClick={capturePhoto}>
                <Camera size={18} />
                {t("photo.capture")}
              </Button>
            </div>
          </div>
        )}

        {profilePhoto && !cameraOn && (
          <div className="flex flex-col items-center gap-5">
            <img
              src={previewUrl}
              alt={t("photo.previewAlt")}
              className={cn(CIRCLE_MEDIA, "object-cover")}
            loading="lazy" decoding="async" />
            <div className="flex gap-4">
              <Button
                type="button"
                className={BTN_SECONDARY}
                onClick={() => setValue("profile_photo", null)}
              >
                {t("photo.changePhoto")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {photoError && <div className={cn(ERROR_MSG, "mt-6")}>{photoError}</div>}

      <div className={ACTIONS}>
        <Button type="button" className={BTN_SECONDARY} onClick={onBack}>
          <BIcon name="arrow-left" /> {t("back")}
        </Button>
        <Button className={BTN_PRIMARY} onClick={handleContinue}>
          {t("continue")} <BIcon name="arrow-right" />
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}

export default StepPhoto;
