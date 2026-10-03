import React, { useRef, useEffect } from "react";
import { motion, useInView, animate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { reveal } from "./reveal";
import s_img01 from "@/assets/score01.webp";
import s_img02 from "@/assets/score02.webp";

const CARD_SHELL =
  "group relative overflow-hidden rounded-xl border border-white/85 bg-white/72 shadow-[0_4px_24px_rgba(80,120,220,0.1),inset_0_1px_0_rgba(255,255,255,0.85)] transition-[transform,translate,scale,box-shadow] duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[7px] hover:scale-[1.01] hover:shadow-[0_20px_52px_rgba(80,120,220,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100";

// Cursor-following spotlight; reads --mouse-x/--mouse-y directly, since
// handleGlowMove already writes suffixed "123px" values.
const CARD_GLOW =
  "pointer-events-none absolute top-0 left-0 z-0 h-full w-full bg-[radial-gradient(600px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(255,255,255,0.6),transparent_40%)] opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100";

const MINI_CARD =
  "group relative z-1 flex-1 overflow-hidden rounded-[20px] border border-white/85 bg-white/78 p-6 shadow-[0_4px_20px_rgba(80,120,220,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-[transform,translate,scale,box-shadow] duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[5px] hover:shadow-[0_14px_38px_rgba(80,120,220,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const CARD_BODY = "relative z-1 flex-1 px-6 pt-5 pb-7";
const CARD_HEADING = "m-0 mb-3 text-[1.3rem] font-bold text-brand-800 max-md:text-[1.15rem]";
const BULLET_LIST = "relative z-1 m-0 mb-1 list-none p-0";

// word-break:keep-all has no utility; break-words covers overflow-wrap.
const BULLET =
  "mb-[0.35rem] flex items-start gap-[9px] text-sm leading-[1.7] font-medium break-words text-brand-800 [word-break:keep-all] before:mt-2 before:h-1.5 before:w-1.5 before:min-w-1.5 before:rounded-full before:bg-brand-600 before:content-[''] max-md:text-[0.82rem]";

const STATS_ROW = "relative z-1 mt-[1.1rem] flex gap-3";
const STAT =
  "flex flex-1 flex-col items-center rounded-md border border-white/72 bg-[linear-gradient(135deg,rgba(58,123,213,0.13),rgba(58,123,213,0.06))] px-2 py-3";
const STAT_NUM = "text-[1.4rem] leading-none font-bold text-brand-800";
const STAT_LABEL =
  "mt-1 text-[0.62rem] font-bold tracking-[0.6px] text-brand-700 uppercase";

// One-off bright green, off the colour scale — kept literal rather than snapped
// to --color-success, which is visibly different.
const PERCENTAGE = "text-[rgb(4,186,4)]";

const IMG_ZONE =
  "relative z-1 flex min-h-[220px] items-center justify-center px-4 pt-8 pb-2 bg-[linear-gradient(180deg,rgba(180,210,255,0.28)_0%,transparent_100%)] max-lg:min-h-[200px] max-lg:flex-1";

const IMG_ZONE_BOTTOM =
  "relative z-1 flex min-h-[220px] items-center justify-center px-4 pt-2 pb-8 bg-[linear-gradient(0deg,rgba(180,210,255,0.25)_0%,transparent_100%)] max-lg:min-h-[200px] max-lg:flex-1";

// Numbers/keys only; labels + bullets come from the home catalog under scorecard.
const stats = [
  { target: 98, suffix: "%", isPercentage: true, key: "accuracy" },
  { target: 3, suffix: "x", isPercentage: false, key: "faster" },
  { target: 50, suffix: "k+", isPercentage: false, key: "matches" },
];

const progressBars = [
  { key: "potentialScore", value: 87 },
  { key: "fitScore", value: 94 },
];

function AnimatedCounter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, target, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = Math.round(value) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function handleGlowMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
  e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
}

function MagneticTag({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.4); // Subtle pull factor
    y.set((e.clientY - centerY) * 0.4);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className="relative z-1 mb-3 inline-flex items-center gap-[5px] rounded-sm bg-linear-135 from-brand-100 to-brand-200 px-3 py-1 text-[0.68rem] font-bold tracking-[0.9px] text-brand-800 uppercase"
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}

function ParallaxImage({ src, size, alt }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

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
      className="flex justify-center [perspective:1200px] [transform-style:preserve-3d]"
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* translateZ lifts the art out of the tilting plane; hover scale is
          group-hover off the card shell. */}
      <img
        src={src}
        alt={alt}
        width={size[0]}
        height={size[1]}
        className="w-full max-w-[320px] object-contain drop-shadow-[0_8px_24px_rgba(58,123,213,0.18)] transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform:translateZ(30px)] group-hover:scale-105 max-lg:max-w-[280px] motion-reduce:transition-none"
      loading="lazy" decoding="async" />
    </motion.div>
  );
}

export function ScoreCard() {
  const { t } = useTranslation("home");
  const bullets = t("scorecard.bullets", { returnObjects: true });

  return (
    <section
      className="relative mt-4 overflow-hidden bg-bg-subtle px-[clamp(1rem,6vw,4rem)] py-12 max-md:mt-8 max-md:px-[clamp(1rem,5vw,1.5rem)] max-md:py-8"
      id="scorecards"
    >
      {/* Background orbs; decorative, stays physical to keep the same diagonal placement regardless of locale direction */}
      <div
        className="pointer-events-none absolute -top-[130px] -right-[130px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(120,160,255,0.22)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-[100px] -left-[100px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(160,190,255,0.18)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* Scroll-driven header reveal via animation-timeline:view(). */}
      <div className="relative z-2 mb-14 animate-appear-heading text-center [animation-range:entry_0%_cover_40%] [animation-timeline:view()] max-md:mb-8">
        <span className="mb-[1.1rem] inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-5 py-1.5 text-[0.72rem] font-bold tracking-[1.3px] text-brand-800 uppercase">
          <span className="h-[7px] w-[7px] animate-dot-pulse rounded-full bg-brand-600 motion-reduce:animate-none" />
          {t("scorecard.badge")}
        </span>
        <h2 className="m-0 mb-[0.6rem] text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.2] font-bold text-brand-800 max-md:text-[1.55rem]">
          <Trans
            t={t}
            i18nKey="scorecard.title"
            components={{
              hl: (
                <span className="bg-linear-135 from-brand-800 from-20% to-brand-600 to-80% bg-clip-text text-transparent" />
              ),
            }}
          />
        </h2>
        <p className="m-0 text-base font-normal text-brand-700">
          {t("scorecard.subtitle")}
        </p>
      </div>

      {/* Cards grid */}
      <div className="relative z-2 mx-auto grid max-w-[1140px] grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-[1.1rem]">
        {/* ── LEFT CARD ── */}
        <motion.div
          className={cn(CARD_SHELL, "flex flex-col max-lg:col-span-2 max-lg:flex-row max-md:col-span-1 max-md:flex-col")}
          {...reveal()}
          onMouseMove={handleGlowMove}
        >
          <div className={CARD_GLOW} />
          <div className={IMG_ZONE}>
            <ParallaxImage src={s_img01} size={[1400, 1162]} alt="" />
          </div>
          <div className={CARD_BODY}>
            <MagneticTag>⚡ {t("scorecard.tagFeature")}</MagneticTag>
            <h3 className={CARD_HEADING}>{t("scorecard.skillMatching")}</h3>
            <ul className={BULLET_LIST}>
              {bullets.map((b) => (
                <li key={b} className={BULLET}>
                  {b}
                </li>
              ))}
            </ul>
            <div className={STATS_ROW}>
              {stats.map((s) => (
                <div key={s.key} className={STAT}>
                  <span className={cn(STAT_NUM, s.isPercentage && PERCENTAGE)}>
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </span>
                  <span className={STAT_LABEL}>{t(`scorecard.stats.${s.key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Center: two stacked mini-cards in a transparent shell (not CARD_SHELL). */}
        <motion.div
          className="flex flex-col gap-4"
          {...reveal({ delay: 0.1 })}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top mini */}
          <div className={MINI_CARD} onMouseMove={handleGlowMove}>
            <div className={CARD_GLOW} />
            <MagneticTag>🎯 {t("scorecard.tagSmart")}</MagneticTag>
            <h3 className={CARD_HEADING}>{t("scorecard.aiScreening")}</h3>
            <ul className={BULLET_LIST}>
              {bullets.slice(0, 3).map((b) => (
                <li key={b} className={BULLET}>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom mini – Growth */}
          <div
            className={cn(MINI_CARD, "flex flex-col items-center bg-white/75 text-center")}
            onMouseMove={handleGlowMove}
          >
            <div className={CARD_GLOW} />
            <div className="relative z-1 mx-auto mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-[15px] bg-linear-135 from-brand-200 to-brand-300 shadow-[0_4px_14px_rgba(59,130,246,0.22)]">
              <span
                className="pointer-events-none absolute -inset-1 z-0 animate-sc-ping rounded-[18px] border-2 border-brand-500 motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -inset-1 z-0 animate-sc-ping rounded-[18px] border-2 border-brand-500 [animation-delay:1s] motion-reduce:animate-none"
                aria-hidden="true"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="relative z-1 h-6 w-6 stroke-brand-700"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h3 className="relative z-1 m-0 mb-3 text-[1.15rem] font-bold text-brand-800">
              {t("scorecard.growthTitle")}
            </h3>
            <p className="relative z-1 m-0 mb-4 text-center text-[0.85rem] leading-[1.75] font-medium text-brand-700">
              {t("scorecard.growthDesc")}
            </p>
            {progressBars.map((bar) => (
              <div key={bar.key} className="relative z-1 mt-[0.85rem] w-full">
                <div className="mb-[5px] flex justify-between text-xs font-semibold text-brand-700">
                  <span>{t(`scorecard.${bar.key}`)}</span>
                  <span className={PERCENTAGE}>
                    <AnimatedCounter target={bar.value} suffix="%" />
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(58,123,213,0.15)]">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar.value}%` }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT CARD ── */}
        <motion.div
          className={cn(CARD_SHELL, "flex flex-col")}
          {...reveal({ delay: 0.2 })}
          onMouseMove={handleGlowMove}
        >
          <div className={CARD_GLOW} />
          <div className={CARD_BODY}>
            <MagneticTag>📊 {t("scorecard.tagAnalytics")}</MagneticTag>
            <h3 className={CARD_HEADING}>{t("scorecard.performance")}</h3>
            <ul className={BULLET_LIST}>
              {bullets.map((b) => (
                <li key={b} className={BULLET}>
                  {b}
                </li>
              ))}
            </ul>
            <div className={STATS_ROW}>
              <div className={STAT}>
                <span className={STAT_NUM}>
                  <AnimatedCounter target={12} suffix="k" />
                </span>
                <span className={STAT_LABEL}>{t("scorecard.stats.reports")}</span>
              </div>
              <div className={STAT}>
                <span className={cn(STAT_NUM, PERCENTAGE)}>
                  <AnimatedCounter target={99} suffix="%" />
                </span>
                <span className={STAT_LABEL}>{t("scorecard.stats.uptime")}</span>
              </div>
            </div>
          </div>
          <div className={IMG_ZONE_BOTTOM}>
            <ParallaxImage src={s_img02} size={[1400, 881]} alt="" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
