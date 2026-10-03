import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import employerImg from "@/assets/employer-get.webp";
import candidateImg from "@/assets/candidate-get.webp";

// Static per-role config; display strings come from the auth catalog at render.
// imgClass sets each illustration's float scale and animation offset so the two
// don't bob in lockstep.
const ROLE_CONFIG = [
  {
    key: "employer",
    imgClass: "[--img-scale:1.25]",
    img: employerImg,
    route: "/employer/sign-in",
    primary: false,
  },
  {
    key: "candidate",
    imgClass: "[--img-scale:0.95] [animation-delay:-3s]",
    img: candidateImg,
    route: "/employee/sign-in",
    primary: true,
  },
];

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemStill = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

// Title staggers its own words in.
const titleGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
};

const wordReveal = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  },
};

const subtitleReveal = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const ARROW_BASE =
  "mt-5 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-brand-300 bg-bg-card text-brand-600 transition-[transform,translate,scale,background-color,color] duration-250 group-hover:translate-x-1 group-hover:bg-brand-500 group-hover:text-white motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";

// Attention pulse-ring on the recommended path.
const ARROW_PRIMARY =
  "relative border-transparent bg-brand-500 text-white shadow-brand after:pointer-events-none after:absolute after:inset-0 after:animate-gs-pulse after:rounded-[inherit] after:border-2 after:border-brand-400 after:content-[''] motion-reduce:after:animate-none";

// Role card with a cursor-following 3D tilt; all motion is disabled under reduced-motion.
function RoleCard({ role, navigate, reduceMotion, variants, t }) {
  const title = t(`getStarted.${role.key}Title`);
  const desc = t(`getStarted.${role.key}Desc`);
  const imgAlt = t(`getStarted.${role.key}ImgAlt`);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], ["7deg", "-7deg"]), {
    stiffness: 200,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], ["-7deg", "7deg"]), {
    stiffness: 200,
    damping: 18,
  });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    px.set(0);
    py.set(0);
  };

  const tilt = reduceMotion
    ? {}
    : {
        onMouseMove: handleMove,
        onMouseLeave: handleLeave,
        style: { rotateX, rotateY, transformPerspective: 900 },
      };

  return (
    <motion.button
      type="button"
      className="group relative flex max-w-[460px] flex-1 basis-0 cursor-pointer flex-col items-center rounded-xl border border-border-soft bg-bg-card px-6 pt-6 pb-7 text-center font-[inherit] shadow-sm transition-[box-shadow,border-color] duration-300 will-change-transform hover:border-brand-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-border-focus max-md:w-full max-md:max-w-[440px] max-md:px-6 max-md:py-7 max-sm:px-5 max-sm:py-6 motion-reduce:transition-none"
      onClick={() => navigate(role.route)}
      aria-label={t("getStarted.cardAria", { title, desc })}
      variants={variants}
      whileHover={reduceMotion ? undefined : { y: -8 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      {...tilt}
    >
      <span className="mb-4 flex h-[280px] w-full items-center justify-center max-md:h-[200px] max-sm:h-[170px]">
        <img
          src={role.img}
          alt={imgAlt}
          loading="eager"
          className={cn(
            "h-full w-full animate-gs-float object-contain motion-reduce:animate-none",
            role.imgClass,
          )}
        />
      </span>

      <span className="flex flex-col items-center">
        <span className="text-2xl font-bold text-text-main max-sm:text-xl">
          {title}
        </span>
        <span className="mt-1 text-base text-text-muted max-sm:text-sm">
          {desc}
        </span>
        <span
          className={cn(ARROW_BASE, role.primary && ARROW_PRIMARY)}
          aria-hidden="true"
        >
          <ArrowRight size={20} strokeWidth={2.4} className="rtl:-scale-x-100" />
        </span>
      </span>
    </motion.button>
  );
}

export function GetStarted() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation("auth");
  const titleWords = t("getStarted.title").split(" ");

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const riseIn = reduceMotion ? itemStill : item;
  const wordVariant = reduceMotion ? itemStill : wordReveal;
  const subtitleVariant = reduceMotion ? itemStill : subtitleReveal;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg-page px-5 py-2 max-sm:px-4 max-sm:py-6">
      {/* Ambient drifting orbs */}
      <div
        className="pointer-events-none absolute -top-[120px] -left-[100px] z-0 h-[380px] w-[380px] animate-gs-drift-a rounded-full bg-[radial-gradient(circle,var(--color-brand-300),transparent_70%)] opacity-50 blur-[70px] will-change-transform motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-[120px] -bottom-[140px] z-0 h-[440px] w-[440px] animate-gs-drift-b rounded-full bg-[radial-gradient(circle,var(--color-brand-200),transparent_70%)] opacity-50 blur-[70px] will-change-transform motion-reduce:animate-none"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-1 flex w-full max-w-[1080px] flex-col items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.header className="mb-10 text-center" variants={riseIn}>
          <motion.span
            className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-full bg-brand-100 text-brand-600 shadow-sm"
            aria-hidden="true"
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.15,
            }}
          >
            <Users size={22} strokeWidth={2.2} />
          </motion.span>
          <motion.h1
            className="m-0 text-4xl leading-[1.15] font-bold text-text-main max-md:text-3xl max-sm:text-2xl"
            variants={titleGroup}
            initial="hidden"
            animate="show"
            aria-label={t("getStarted.title")}
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                className="me-[0.26em] inline-block will-change-[transform,filter] last:me-0"
                variants={wordVariant}
                aria-hidden="true"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            className="mt-2 mb-0 text-base text-text-muted"
            variants={subtitleVariant}
            initial="hidden"
            animate="show"
          >
            {t("getStarted.subtitle")}
          </motion.p>
        </motion.header>

        <div className="flex w-full items-stretch justify-center gap-6 max-md:flex-col max-md:items-center max-md:gap-5">
          {ROLE_CONFIG.map((role) => (
            <RoleCard
              key={role.key}
              role={role}
              navigate={navigate}
              reduceMotion={reduceMotion}
              variants={riseIn}
              t={t}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
