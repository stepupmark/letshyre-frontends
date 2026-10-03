import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Bot, Zap, TrendingUp, Search, ShieldCheck } from "lucide-react";

// Cursor-following spotlight is a ::before whose gradient centre reads
// --mouse-x/--mouse-y, written per-card by handleMouseMove below.
const CARD =
  "group relative flex flex-col items-center text-center justify-start overflow-hidden rounded-xl border border-white/10 bg-neutral-50 p-10 transition-[transform,translate,scale,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(800px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.6),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] hover:-translate-y-[5px] hover:bg-bg-card hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] hover:before:opacity-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

// Wide card's spotlight is dimmer since it sits on a near-black gradient; after: is the noise texture.
const CARD_WIDE =
  "col-span-2 bg-linear-135 from-neutral-900 to-text-body text-white before:bg-[radial-gradient(800px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.1),transparent_40%)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[image:var(--bento-noise)] after:opacity-5 after:content-[''] hover:from-text-body hover:to-text-main max-lg:col-span-1 max-md:flex-col-reverse md:flex-row md:items-center md:justify-between md:text-start";

const CARD_HIGHLIGHT = "bg-brand-100";

const ICON_WRAP =
  "relative z-1 mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-brand-200";
const ICON_WRAP_WIDE = "mb-6 md:mb-0 h-20 w-20 rounded-[20px] bg-white/10 flex shrink-0 items-center justify-center relative z-1";
const ICON_WRAP_HIGHLIGHT = "bg-bg-card shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]";

const ICON = "size-7 text-brand-600";
const ICON_WIDE = "size-10 text-brand-400";

const TITLE = "mb-3 text-[clamp(1.15rem,1.5vw,1.4rem)] font-bold text-neutral-900";
const TITLE_WIDE = "text-white";
const DESC = "text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.6] text-text-muted";
const DESC_WIDE = "text-neutral-300";

// Icons + layout flags only; titles/descriptions come from the about catalog.
const cards = [
  { key: "aiPowered", icon: Bot, wide: true },
  { key: "faster", icon: Zap },
  { key: "network", icon: TrendingUp },
  { key: "payPerUnlock", icon: Search, highlight: true },
  { key: "transparency", icon: ShieldCheck },
];

function BentoCard({ card }) {
  const { t } = useTranslation("about");
  const media = (
    <div
      className={cn(
        ICON_WRAP,
        card.wide && ICON_WRAP_WIDE,
        card.highlight && ICON_WRAP_HIGHLIGHT,
      )}
    >
      <card.icon className={card.wide ? ICON_WIDE : ICON} />
    </div>
  );

  const body = (
    <div className={cn("relative z-1", card.wide && "md:max-w-[60%]")}>
      <h3 className={cn(TITLE, card.wide && TITLE_WIDE)}>{t(`why.cards.${card.key}.title`)}</h3>
      <p className={cn(DESC, card.wide && DESC_WIDE)}>{t(`why.cards.${card.key}.desc`)}</p>
    </div>
  );

  return (
    <div
      className={cn(
        CARD,
        card.wide && CARD_WIDE,
        card.highlight && CARD_HIGHLIGHT,
      )}
    >
      {/* The wide card reads text-then-icon; the square cards icon-then-text. */}
      {card.wide ? (
        <>
          {body}
          {media}
        </>
      ) : (
        <>
          {media}
          {body}
        </>
      )}
    </div>
  );
}

export function AboutWhy() {
  const { t } = useTranslation("about");
  const gridRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    for (const card of gridRef.current.children) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="mb-[clamp(2rem,4vw,4rem)] text-center text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold">
        {t("why.heading")}
      </h2>

      <div
        className="grid auto-rows-[minmax(250px,auto)] grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1"
        ref={gridRef}
        onMouseMove={handleMouseMove}
      >
        {cards.map((card) => (
          <BentoCard key={card.key} card={card} />
        ))}
      </div>
    </motion.section>
  );
}
