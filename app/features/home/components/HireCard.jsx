import { Link } from "react-router";
import { motion } from "framer-motion";
import { reveal, revealViewport } from "./reveal";

const MotionLink = motion.create(Link);
import { useTranslation } from "react-i18next";

import hire01 from "@/assets/hire-img01.webp";

// Four decorative wave layers behind the illustration — same curve, staggered by
// duration/delay so they drift out of phase.
const WAVE_LAYERS = [
  {
    key: "01",
    width: "w-[93%] max-lg:w-[88%]",
    radius: "rounded-[30%_8%_8%_100%/100%_8%_8%_0%]",
    bg: "bg-[linear-gradient(120deg,var(--color-brand-500)_13%,var(--color-brand-400)_25%,#cdfcf3_40%)]",
    timing: "",
  },
  {
    key: "02",
    width: "w-[75%] max-lg:w-[70%]",
    radius: "rounded-[42%_5%_8%_100%/100%_5%_8%_0%]",
    bg: "bg-[linear-gradient(110deg,var(--color-brand-500)_13%,var(--color-brand-400)_26%,#cdfcf3_50%)]",
    timing: "[animation-duration:9s] [animation-delay:1s]",
  },
  {
    key: "03",
    width: "w-[55%] max-lg:w-[52%]",
    radius: "rounded-[50%_5%_8%_100%/100%_5%_8%_0%]",
    bg: "bg-[linear-gradient(120deg,var(--color-brand-500)_15%,var(--color-brand-400)_26%,#cdfcf3_70%)]",
    timing: "[animation-duration:10s] [animation-delay:2s]",
  },
  {
    key: "04",
    width: "w-[38%] max-lg:w-[36%]",
    radius: "rounded-[60%_5%_8%_100%/100%_5%_8%_0%]",
    bg: "bg-[linear-gradient(120deg,var(--color-brand-500)_13%,var(--color-brand-400)_26%,var(--color-brand-500)_40%)]",
    timing: "[animation-duration:11s] [animation-delay:3s]",
  },
];

const BUTTON_BASE =
  "z-6 inline-block cursor-pointer rounded-[22px] border-none text-center no-underline px-2.5 py-4 text-[0.8rem] w-[31%] max-md:w-[92%] max-md:px-3 max-md:py-[11px] max-md:text-[0.9rem]";

const BUTTON_ARROW = "ms-1 inline-block rtl:-scale-x-100";

export function HireCard() {
  const { t } = useTranslation("home");

  const titleText = t("hireCard.title");
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <section className="flex items-center justify-center bg-bg-page py-[5%] max-md:py-0">
      <motion.div
        className="relative flex h-auto w-[80%] rounded-[22px] bg-brand-500 max-lg:w-[90%] max-lg:flex-row max-lg:gap-4 max-lg:rounded-[20px] max-md:w-[96%] max-md:flex-col-reverse max-md:items-center max-md:rounded-[18px] max-md:pt-[5%] max-md:bg-[linear-gradient(180deg,var(--color-brand-500)_0%,var(--color-brand-300)_30%,var(--color-brand-500)_80%)] max-md:shadow-[2px_2px_14px_rgb(35,36,45),inset_0_0_10px_rgb(255,255,255)]"
        {...reveal()}
      >
        <div className="z-6 w-[60%] pt-[7%] pe-[2%] pb-[7%] ps-[3%] max-lg:w-[58%] max-lg:px-[3%] max-lg:py-[6%] max-md:w-full max-md:px-[4%] max-md:py-[5%] max-md:text-center">
          <motion.h2
            className="mb-4 text-[2.2rem] font-bold text-white [text-shadow:0_4px_15px_rgba(0,0,0,0.1)] max-md:text-[1.4rem] max-md:leading-[1.1]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {titleText.split(" ").map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="me-2 inline-block">
                {word}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
            className="mb-8 text-[1.05rem] leading-[1.6] font-medium text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.25)] max-md:text-[0.92rem]"
            {...reveal({ delay: 0.4, y: 0 })}
          >
            {t("hireCard.description")}
          </motion.p>
          <div className="mt-[5%] max-md:mt-4 max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-[0.6rem]">
            <MotionLink
              to="/employer/sign-in"
              className={`${BUTTON_BASE} bg-[rgb(38,37,37)] font-semibold text-white shadow-[2px_2px_15px_rgb(49,48,48),inset_0_0_5px_rgb(164,164,164)] hover:shadow-[2px_2px_15px_var(--color-neutral-900)]`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("hireCard.startHiring")}
              <span className={BUTTON_ARROW} aria-hidden="true">
                &rarr;
              </span>
            </MotionLink>
            <MotionLink
              to="/employee/sign-in"
              className={`${BUTTON_BASE} ms-[2%] bg-[linear-gradient(45deg,rgb(105,167,244),rgb(190,235,253))] font-bold text-[rgb(52,51,51)] shadow-[2px_2px_14px_rgb(89,95,158),inset_0_0_6px_var(--color-bg-card)] hover:shadow-[2px_2px_20px_rgb(89,111,158)] max-md:ms-0`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("hireCard.applyJob")}
              <span className={BUTTON_ARROW} aria-hidden="true">
                &rarr;
              </span>
            </MotionLink>
          </div>
        </div>
        <div className="z-6 w-[40%] max-lg:w-[42%] max-md:flex max-md:w-[95%] max-md:justify-center">
          <motion.img
            className="w-full scale-120 max-lg:h-auto max-lg:w-full max-md:w-[90%] max-md:max-w-[320px] max-md:scale-100"
            src={hire01}
            alt=""
            width={1400}
            height={1223}
            loading="lazy"
            decoding="async"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        {WAVE_LAYERS.map((layer) => (
          <div
            key={layer.key}
            aria-hidden="true"
            className={`absolute end-0 z-2 h-full origin-[right_center] animate-wave-pulse max-md:hidden motion-reduce:animate-none ${layer.width} ${layer.radius} ${layer.bg} ${layer.timing}`}
          />
        ))}
      </motion.div>
    </section>
  );
}
