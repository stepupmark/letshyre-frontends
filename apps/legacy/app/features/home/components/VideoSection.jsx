import React from "react";
import { motion } from "framer-motion";
import { reveal } from "./reveal";
import { useTranslation } from "react-i18next";
import {
  VS_HEADING_OUTER,
  VS_HEADING,
  VS_HEADING_INNER,
} from "./videoHeadingClasses";

// Two copies per track so translating by half the width loops seamlessly.
const MARQUEE_TEXT =
  "pe-12 text-[10rem] font-bold text-[rgb(206,222,244)] max-lg:pe-4 max-lg:text-[7rem] max-md:text-[4rem] max-sm:text-[2.7rem]";

export function VideoSection() {
  const { t } = useTranslation("home");
  return (
    <>
      <motion.div
        className={VS_HEADING_OUTER}
        id="ai-interview"
        {...reveal()}
      >
        <div className={VS_HEADING}>
          <h2>{t("video.heading")}</h2>
          <div className={VS_HEADING_INNER}>
            <p>{t("video.intro")}</p>
          </div>
        </div>
      </motion.div>

      <div className="relative flex items-center justify-center overflow-hidden bg-bg-page pt-8 pb-0 text-center max-sm:py-8">
        {/* Background Marquee Texts; the horizontal offset is moot at w-full, so it stays physical */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 z-0 flex w-full -translate-y-1/2 flex-col gap-6"
        >
          {/* Line 1 – Left to Right */}
          <div className="w-full overflow-hidden">
            <div className="inline-flex animate-marquee-ltr whitespace-nowrap motion-reduce:animate-none">
              <span className={MARQUEE_TEXT}>LETSHYRE LETSHYRE LETSHYRE </span>
              <span className={MARQUEE_TEXT}>LETSHYRE LETSHYRE LETSHYRE </span>
            </div>
          </div>

          {/* Line 2 – Right to Left */}
          <div className="w-full overflow-hidden">
            <div className="inline-flex animate-marquee-rtl whitespace-nowrap motion-reduce:animate-none">
              <span className={MARQUEE_TEXT}>LETSHYRE LETSHYRE LETSHYRE </span>
              <span className={MARQUEE_TEXT}>LETSHYRE LETSHYRE LETSHYRE </span>
            </div>
          </div>
        </div>

        {/* Foreground Video */}
        <motion.div
          className="relative z-1 mx-auto h-auto w-[80%] max-w-[1000px] overflow-hidden rounded-[20px] border border-white/18 transition-[transform,translate,scale,box-shadow] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_56px_rgba(0,0,0,0.22)] max-sm:w-[95%] motion-reduce:hover:translate-y-0"
          {...reveal({ delay: 0.2 })}
        >
          <video
            src="/ai-Interview.mp4"
            poster="/ai-Interview-thumbnail.webp"
            controls
            controlsList="nodownload"
            playsInline
            preload="metadata"
            aria-label={t("video.videoLabel")}
            className="block h-full w-full cursor-pointer rounded-[inherit] object-cover shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          />
        </motion.div>
      </div>
    </>
  );
}
