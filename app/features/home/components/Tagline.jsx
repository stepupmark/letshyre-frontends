import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { reveal } from "./reveal";

const Tagline = () => {
  const { t } = useTranslation("home");
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <div
      className="w-full text-center max-md:mt-12 lg:mt-auto md:pt-20"
      ref={containerRef}
    >
      <motion.h2
        className="m-0 flex flex-col items-center gap-1 text-[clamp(2rem,5vw,4.5rem)] tracking-[-0.02em] md:flex-row md:justify-center md:gap-4"
        style={{ scale }}
      >
        <motion.span className="font-normal text-neutral-500 italic" {...reveal()}>
          {t("hero.tagline.stop")}
        </motion.span>{" "}
        <motion.span className="font-normal text-brand-accent italic" {...reveal({ delay: 0.3 })}>
          {t("hero.tagline.start")}
        </motion.span>
      </motion.h2>
    </div>
  );
};

export default Tagline;
