import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import employersImg from "@/assets/employers_illustration.webp";
import candidatesImg from "@/assets/candidates_illustration.webp";
import { BIcon } from "@/components/icons/BootstrapIcons";

const ROW = "grid grid-cols-2 items-center gap-[60px] max-lg:grid-cols-1 max-lg:gap-10";

// Flips the row visually via rtl (children reset to ltr) without reordering the
// DOM, so the heading still precedes its illustration for screen readers.
const ROW_REVERSE = "[direction:rtl] [&>*]:[direction:ltr] max-lg:[direction:ltr]";

const VISUAL =
  "group relative flex h-[280px] sm:h-[320px] lg:h-[400px] items-center justify-center overflow-hidden rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]";

const IMAGE =
  "absolute -top-[40px] h-[calc(100%+80px)] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none";

const HEADING =
  "mb-6 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.2] font-extrabold";

const LIST = "flex list-none flex-col gap-[clamp(12px,1.5vw,20px)] p-0";

const ITEM =
  "flex items-start gap-4 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.6] text-neutral-700 [&_i]:mt-0.5 [&_i]:text-[1.2rem] [&_i]:text-success";

function PointList({ points }) {
  return (
    <ul className={LIST}>
      {points.map((point) => (
        <motion.li
          key={point}
          className={ITEM}
          whileHover={{ x: 5, color: "#10b981" }}
          transition={{ duration: 0.2 }}
        >
          <BIcon name="check-circle-fill" />
          {point}
        </motion.li>
      ))}
    </ul>
  );
}

export function AboutWhatWeDo() {
  const { t } = useTranslation("about");
  const employerPoints = t("whatWeDo.employerPoints", { returnObjects: true });
  const candidatePoints = t("whatWeDo.candidatePoints", { returnObjects: true });
  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: containerRef1,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress1, [0, 1], [-40, 40]);

  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: containerRef2,
    offset: ["start end", "end start"],
  });
  const y2 = useTransform(scrollYProgress2, [0, 1], [-40, 40]);

  return (
    <section className="flex flex-col gap-[100px]">
      {/* Row 1: Employers */}
      <motion.div
        className={ROW}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h2 className={HEADING}>{t("whatWeDo.employersHeading")}</h2>
          <PointList points={employerPoints} />
        </div>
        <div className={VISUAL} ref={containerRef1}>
          <motion.img
            style={{ y: y1 }}
            src={employersImg}
            alt={t("whatWeDo.employersImgAlt")}
            className={IMAGE}
          />
        </div>
      </motion.div>

      {/* Row 2: Candidates */}
      <motion.div
        className={cn(ROW, ROW_REVERSE)}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h2 className={HEADING}>{t("whatWeDo.candidatesHeading")}</h2>
          <PointList points={candidatePoints} />
        </div>
        <div className={VISUAL} ref={containerRef2}>
          <motion.img
            style={{ y: y2 }}
            src={candidatesImg}
            alt={t("whatWeDo.candidatesImgAlt")}
            className={IMAGE}
          />
        </div>
      </motion.div>
    </section>
  );
}
