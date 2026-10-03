import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { VS_HEADING_OUTER, VS_HEADING } from "./videoHeadingClasses";
import { BookCheck, Users } from "lucide-react";
import { BIcon } from "@/components/icons/BootstrapIcons";
import Cand01 from "@/assets/Cand01.webp";
import Cand02 from "@/assets/Cand02.webp";
import Cand03 from "@/assets/Cand03.webp";
import Cand04 from "@/assets/Cand04.webp";

const CARD =
  "flex cursor-pointer flex-col items-start gap-0.5 rounded-[13px] border-2 border-transparent bg-brand-200 px-[4%] py-[2%] transition-all duration-[400ms] max-sm:gap-3";

const CARD_ACTIVE =
  "scale-[1.02] border-brand-500 bg-bg-card shadow-[0_8px_25px_rgba(59,130,246,0.15)]";

const SLIDE =
  "absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-[transform,translate,scale,opacity] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

// Icons only; titles/descriptions come from the home catalog under candidate.items.
// person-workspace / bookmark-star-fill have no lucide equivalent, so they stay BIcon (bi).
const ITEMS = [
  { key: "interview", bi: "person-workspace" },
  { key: "evaluation", bi: "bookmark-star-fill" },
  { key: "matching", Icon: BookCheck },
  { key: "hired", Icon: Users },
];

const IMAGES = [Cand01, Cand02, Cand03, Cand04];

export function Candidate() {
  const { t } = useTranslation("home");

  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  const AUTO_TIME = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((prev) => (prev + 1) % IMAGES.length);
    }, AUTO_TIME);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleSelect = (index) => {
    if (index === activeIndex) return;
    setPrevIndex(activeIndex);
    setActiveIndex(index);
  };

  return (
    <>
      <div className={VS_HEADING_OUTER}>
        <div className={VS_HEADING}>
          {/* Direct child (no vs-heading-section-inner wrapper), so it skips that wrapper's width/margin. */}
          <p className="text-brand-600">{t("candidate.eyebrow")}</p>
          <h2>
            <Trans t={t} i18nKey="candidate.title" components={{ br: <br /> }} />
          </h2>
        </div>
      </div>
      <div className="flex w-full items-center gap-[12%] bg-bg-page px-[5%] pt-[4%] pb-[6%] max-xl:gap-[8%] max-lg:flex-col max-lg:items-center max-lg:gap-10 max-md:px-[6%] max-md:pb-[10%] 2xl:px-[12%]">
        {/* Left image slider */}
        <div className="flex h-[90vh] max-h-[46rem] w-[48%] items-center justify-center rounded-[20px] bg-brand-200 max-xl:h-[75vh] max-lg:h-[450px] max-lg:w-full max-lg:max-w-[620px] max-md:h-[380px]">
          <div className="flex h-[90%] w-[94%] items-end justify-center rounded-[15px] bg-[linear-gradient(180deg,var(--color-brand-500),white)]">
            <div className="relative h-[92%] w-[98%] overflow-hidden rounded-lg bg-bg-card">
              {IMAGES.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    SLIDE,
                    index === activeIndex && "z-2 scale-100 opacity-100",
                    index === prevIndex && "z-1 scale-95 opacity-0",
                  )}
                loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
        </div>

        {/* Right cards */}
        <div className="flex w-[38%] flex-col gap-[15px] py-5 max-xl:w-[42%] max-lg:w-full max-lg:max-w-[620px]">
          {ITEMS.map((item, index) => (
            <div
              key={item.key}
              className={cn(CARD, activeIndex === index && CARD_ACTIVE)}
              onClick={() => handleSelect(index)}
            >
              <h3 className="mb-1.5 text-xl font-semibold text-text-body max-md:text-lg">
                {item.bi ? (
                  <BIcon name={item.bi} className="inline size-5 scale-130 text-brand-600 align-[-0.125em]" />
                ) : (
                  <item.Icon className="inline size-5 scale-130 text-brand-600 align-[-0.125em]" />
                )}{" "}
                {t(`candidate.items.${item.key}.title`)}
              </h3>
              <p className="mb-[3px] max-w-[90%] text-sm leading-[1.6] text-neutral-600 max-md:text-[13px]">
                {t(`candidate.items.${item.key}.desc`)}
              </p>
              <div className="relative h-1 w-[80%] overflow-hidden rounded-[5px] bg-brand-200 max-lg:w-[70%] max-md:w-[65%]">
                {activeIndex === index && (
                  <motion.div
                    className="absolute top-0 start-0 h-full rounded-[5px] bg-brand-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTO_TIME / 1000, ease: "linear" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
