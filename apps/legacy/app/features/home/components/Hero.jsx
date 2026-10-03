import { Link } from "react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

import heroImg from "@/assets/hero1.webp";
import first_part_bg from "@/assets/FP_bg.webp";
import Tagline from "./Tagline";

// Button variants are local: both are used only here and share ~12 classes.
const BTN_BASE =
  "group cursor-pointer rounded-sm border-0 px-7 py-3.5 text-center text-base font-semibold transition-all max-md:w-full max-xs:px-4 max-xs:py-3 max-xs:text-[0.95rem] 2xl:px-8 2xl:py-4 2xl:text-lg motion-reduce:hover:translate-y-0";

const BTN_PRIMARY =
  "bg-linear-135 from-text-main to-text-body text-white shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 hover:from-neutral-800 hover:to-neutral-700 hover:shadow-lg";

const BTN_SECONDARY =
  "border border-neutral-300 bg-card text-brand-900 shadow-sm hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50";

const BTN_ARROW =
  "ms-1 inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 rtl:-scale-x-100";

// Odd segments are the ones the catalog wrapped in <hl>.
const splitHighlight = (heading) =>
  heading.split(/<\/?hl>/).map((text, i) => ({ text, accent: i % 2 === 1 }));

export function Hero() {
  const { t } = useTranslation("home");

  // 3D parallax tilt driven by pointer position.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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
    <section
      className="relative flex flex-col overflow-hidden bg-bg-card px-4 pt-16 pb-12 md:px-8 md:pt-24 md:pb-8 lg:min-h-[min(100svh,60rem)] lg:justify-center lg:px-16 lg:pb-4 2xl:px-24"
      id="home"
    >
      <div className="z-10 mx-auto flex w-full max-w-content flex-col items-center lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-16 2xl:max-w-[1536px] 2xl:gap-24">
        <div className="flex w-full max-w-[600px] animate-fade-up flex-col items-start motion-reduce:animate-none lg:w-1/2 2xl:max-w-[750px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-neutral-50 px-3.5 py-1.5 text-sm font-medium text-text-muted transition-all hover:border-neutral-300 hover:bg-neutral-100 max-md:mt-12">
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold tracking-[0.05em] text-brand-600 uppercase">
              {t("hero.badgeNew")}
            </span>{" "}
            {t("hero.badgeText")}
          </div>

          {/* Static on purpose: the column's CSS fade-up runs without JS, so the
              heading and copy are visible from the first paint. */}
          <h1 className="mb-2 text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] font-normal tracking-[-0.02em] text-text-main">
            {splitHighlight(t("hero.title")).map(({ text, accent }, i) =>
              accent ? (
                <span key={i} className="text-brand-accent italic">
                  {text}
                </span>
              ) : (
                text
              ),
            )}
          </h1>

          <p className="mb-8 max-w-[580px] text-[clamp(0.95rem,1.5vw,1.1rem)] leading-[1.6] text-neutral-500 2xl:max-w-[650px]">
            {t("hero.description")}
          </p>

          <div className="mb-6 flex w-full flex-wrap gap-4 max-md:flex-col">
            <Link to="/employer/sign-in" className={`${BTN_BASE} ${BTN_PRIMARY} no-underline`}>
              {t("hero.ctaHiring")} <span className={BTN_ARROW} aria-hidden="true">&rarr;</span>
            </Link>
            <Link to="/employee/sign-in" className={`${BTN_BASE} ${BTN_SECONDARY} no-underline`}>
              {t("hero.ctaJob")} <span className={BTN_ARROW} aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="mt-2 flex w-full items-end gap-6 md:gap-8 2xl:mt-4">
            <div className="flex flex-none flex-col items-center justify-center rounded-md border border-brand-300 bg-brand-100 p-4 max-xs:px-4 max-xs:py-3 2xl:p-6">
              <span className="text-[clamp(1.5rem,4vw,2rem)] leading-none font-bold text-brand-600 2xl:text-[2.5rem]">
                100%
              </span>
              <p className="mt-1.5 text-[clamp(0.65rem,2vw,0.65rem)] font-semibold tracking-[0.05em] text-neutral-600 uppercase 2xl:text-sm">
                {t("hero.verifiedLabel")}
              </p>
            </div>
            <div className="flex flex-auto flex-col justify-center gap-1.25">
              <p className="mt-0 text-[clamp(0.75rem,2vw,0.85rem)] leading-[1.2] text-neutral-500 2xl:text-base">
                {t("hero.increaseBy")}
              </p>
              <span className="my-1 text-[clamp(1.25rem,4vw,1.75rem)] font-bold text-brand-900 2xl:text-[2rem]">
                40%
              </span>
              <a
                href="#how-it-works"
                className="group text-[clamp(0.75rem,2vw,0.85rem)] font-semibold text-brand-600 no-underline transition-opacity duration-200 hover:underline hover:opacity-80 2xl:text-base"
              >
                {t("hero.seeCategories")}
                <span className={BTN_ARROW} aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Hand-composed fade-up (1s, 0.2s delay) since it differs from the copy column's timing. */}
        <div className="relative mt-12 hidden w-full max-w-[600px] animate-[fade-up_1s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards] opacity-0 [perspective:1200px] lg:block lg:mt-0 lg:w-[45%] 2xl:max-w-[800px]">
          <motion.div
            className="relative rounded-lg bg-card p-2 shadow-[var(--shadow-xl),0_0_0_1px_rgba(0,0,0,0.03)] transition-[box-shadow] duration-500 lg:hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.2)]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <img
              src={heroImg}
              alt={t("hero.imgAlt")}
              width={1024}
              height={1024}
              className="block w-full rounded-md border border-neutral-100 object-cover [transform:translateZ(40px)]"
            />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,rgba(255,255,255,0)_60%)] motion-reduce:animate-none" />
          </motion.div>
        </div>
      </div>
      <Tagline />

      {/* Ambient gradient blur from the background shape; decorative, stays physical to keep its diagonal placement regardless of locale direction. */}
      <img
        className="pointer-events-none absolute -top-[15%] -right-[10%] z-1 w-[80vw] max-w-[1000px] opacity-50 blur-[80px]"
        src={first_part_bg}
        alt=""
        width={745}
        height={1168}
        decoding="async"
        aria-hidden="true"
      />
    </section>
  );
}
