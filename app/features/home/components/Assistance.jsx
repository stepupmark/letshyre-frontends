import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import assit01 from "@/assets/assit01.webp";
import assit02 from "@/assets/assit02.webp";
import assit03 from "@/assets/assit03.webp";
import assit04 from "@/assets/assit04.webp";

// Rows swap sides via `order` at md+ (not DOM reversal) so the heading always
// precedes its illustration in reading order.
const ROW =
  "flex flex-col items-center gap-[clamp(2rem,5vw,3rem)] border-b-[0.5px] border-b-[rgba(0,0,0,0.08)] py-[clamp(3rem,8vw,6rem)] last:border-b-0 md:relative md:z-1 md:grid md:grid-cols-2 md:items-center md:gap-[10%]";

// Images + layout only; copy lives in the home catalog under assistance.steps.
// size is the file's own, so the space is reserved before it loads.
const STEPS = [
  { key: "post", number: 1, image: assit01, size: [1286, 1400], layout: "image-first", color: "#e6f1fb" },
  { key: "screen", number: 2, image: assit02, size: [1400, 1083], layout: "text-first", color: "#e8f0fe" },
  { key: "scorecards", number: 3, image: assit03, size: [1379, 1400], layout: "image-first", color: "#eef2ff" },
  { key: "hire", number: 4, image: assit04, size: [1289, 1400], layout: "text-first", color: "#e6f1fb" },
];

const TiltImage = ({ src, size, alt, color }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="relative flex w-full max-w-[500px] items-center justify-center [transform-style:preserve-3d]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
    >
      {/* Tint is per-step data, so it stays an inline background-color. */}
      <div
        className="absolute top-[10%] start-[10%] -z-10 h-[80%] w-[80%] animate-ambient-glow rounded-full opacity-80 blur-[60px] motion-reduce:animate-none"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <img
        src={src}
        alt={alt}
        width={size[0]}
        height={size[1]}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full rounded-lg bg-bg-card object-contain shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-[box-shadow] duration-300 [transform:translateZ(30px)]"
      />
    </motion.div>
  );
};

const StepBlock = ({ step }) => {
  const { t } = useTranslation("home");
  const isImageFirst = step.layout === "image-first";
  const base = `assistance.steps.${step.key}`;

  return (
    <div className={ROW}>
      <motion.div
        className={cn(
          "relative flex w-full justify-center [perspective:1000px]",
          isImageFirst ? "order-2 md:order-1" : "order-2 md:order-2",
        )}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-20% 0px -20% 0px", amount: "some" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <TiltImage src={step.image} size={step.size} alt={t(`${base}.imageAlt`)} color={step.color} />
      </motion.div>

      <motion.div
        className={cn("w-full", isImageFirst ? "order-1 md:order-2" : "order-1 md:order-1")}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-20% 0px -20% 0px", amount: "some" }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
      >
        <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-300 bg-brand-100 py-[5px] pe-3.5 ps-[5px] text-[0.78rem] font-semibold tracking-[0.05em] text-brand-800 uppercase">
          <span
            className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand-600 text-[0.72rem] font-bold text-white"
            aria-hidden="true"
          >
            {step.number}
          </span>
          {t(`${base}.pill`)}
        </div>

        <h2 className="m-0 mb-5 text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.1] font-normal tracking-[-0.02em] text-text-main [&_em]:text-brand-accent [&_em]:italic">
          <Trans
            t={t}
            i18nKey={`${base}.heading`}
            components={{ hl: <em />, br: <br /> }}
          />
        </h2>

        <p className="m-0 max-w-[55ch] text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.7] font-normal text-neutral-600">
          {t(`${base}.description`)}
        </p>

        {/* Underline wipes in from the left on hover. */}
        <a
          href="#"
          className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden pb-0.5 text-[0.95rem] font-semibold text-brand-accent no-underline after:absolute after:bottom-0 after:start-0 after:h-0.5 after:w-full after:-translate-x-[101%] after:bg-brand-400 after:transition-transform after:duration-[400ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[''] hover:after:translate-x-0"
        >
          {t(`${base}.link`)}{" "}
          <span
            className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 rtl:-scale-x-100"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </motion.div>
    </div>
  );
};

export function Assistance() {
  const { t } = useTranslation("home");
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      className="w-full bg-bg-page px-[clamp(1.5rem,7vw,6rem)] [overflow-x:clip]"
      id="how-it-works"
      aria-label={t("assistance.ariaLabel")}
      ref={containerRef}
    >
      <div className="relative mx-auto w-full max-w-[1310px]">
        {/* Animated Timeline for Desktop */}
        <div
          className="absolute top-20 bottom-20 left-1/2 z-0 hidden w-0.5 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,rgba(181,212,244,0.4)_0,rgba(181,212,244,0.4)_6px,transparent_6px,transparent_12px)] md:block"
          aria-hidden="true"
        >
          <motion.div
            className="w-full origin-top rounded-[2px] bg-linear-to-b from-brand-accent to-brand-400 shadow-[0_0_10px_rgba(24,95,165,0.3)]"
            style={{ height: lineHeight }}
          />
        </div>

        {STEPS.map((step) => (
          <StepBlock key={step.number} step={step} />
        ))}
      </div>
    </section>
  );
}
