import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router";
import { toast } from "@/lib/toast";
import { Trans, useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

import {
  UpArrowIcon,
  PrintIcon,
  SearchIcon,
  ExpandIcon,
  CollapseIcon,
} from "@/features/legal/components/Icons";

// The sidebar is sticky, so it's unmounted in JS at lg-down (!isMobile) rather
// than display:none'd; this class only handles print.
const SIDEBAR =
  "sticky top-24 rounded-[20px] border border-white/80 bg-white/90 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md print:hidden";

const CONTENT_AREA =
  "rounded-xl border border-white/80 bg-card p-16 shadow-[0_15px_40px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] max-lg:rounded-lg max-lg:px-6 max-lg:py-10 max-md:px-4 max-md:py-6 print:border-none print:p-0 print:shadow-none";

const SEARCH_BOX =
  "mb-6 flex items-center rounded-sm border border-border bg-neutral-100 px-4 py-2 transition-[border-color] focus-within:border-brand-400 focus-within:bg-card";

const SEARCH_INPUT =
  "w-full border-none bg-transparent text-base text-neutral-700 outline-none";

// Prose styling for the policy body, applied from the container so the content
// files don't repeat classes on every <p>/<ul>. The bullet is a checkmark
// data-URI in --policy-bullet (tailwind.css) — its punctuation can't survive
// Tailwind's arbitrary-value brackets.
const PROSE = [
  "[&_p]:mb-4 [&_p]:text-neutral-700",
  "[&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-3 [&_ul]:ps-2",
  "[&_li]:relative [&_li]:ps-9 [&_li]:text-text-muted",
  "[&_li]:before:absolute [&_li]:before:top-[0.4rem] [&_li]:before:start-0",
  "[&_li]:before:size-5 [&_li]:before:bg-[image:var(--policy-bullet)]",
  "[&_li]:before:bg-contain [&_li]:before:bg-no-repeat [&_li]:before:content-['']",
  "print:[&_li]:text-text-main print:[&_li]:text-[12pt]",
  "print:[&_p]:text-text-main print:[&_p]:text-[12pt]",
].join(" ");

// Three font-size levels. The A-/A+ control that drives this is commented out
// below, so fontSizeLevel stays 1 and levels 0/2 are unreachable today — kept
// intact so un-commenting the control restores the feature.
const FONT_LEVEL = {
  0: "[&_p]:text-base [&_p]:leading-[1.6] [&_li]:text-base [&_li]:leading-[1.6]",
  1: "[&_p]:text-[1.1rem] [&_p]:leading-[1.8] [&_li]:text-[1.1rem] [&_li]:leading-[1.8]",
  2: "[&_p]:text-xl [&_p]:leading-[1.9] [&_li]:text-xl [&_li]:leading-[1.9]",
};

const TITLE_LEVEL = {
  0: "text-[1.6rem]",
  1: "text-[1.85rem]",
  2: "text-[2rem]",
};

export function PolicyLayout({ title, intro, sections }) {
  const { pathname } = useLocation();
  // The /:lang segment, not the app locale — that one seeds from localStorage
  // and resolves to the default during prerender.
  const urlLang = pathname.split("/")[1];
  const { t } = useTranslation("legal");
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 small, 1 normal, 2 large
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const readTime = useMemo(() => {
    const wordCount = sections.reduce((acc, section) => {
      // rough estimate: title words + ~40 per section
      return acc + section.title.split(" ").length + 40;
    }, 0);
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    return sections.filter((sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, sections]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const checkMobile = () => {
      const mobile = window.innerWidth <= 860;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scrollToSection = (id) => {
    if (isMobile) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -120;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only called from the commented-out font-size/print controls below.
  const _handlePrint = () => {
    window.print();
  };

  const handleFeedback = (isHelpful) => {
    setFeedbackGiven(isHelpful ? "yes" : "no");
    toast.success(t("chrome.feedbackThanks"));
  };

  const _changeFontSize = (delta) => {
    setFontSizeLevel((prev) => {
      const next = prev + delta;
      return next >= 0 && next <= 2 ? next : prev;
    });
  };

  useEffect(() => {
    // Coalesce to one measurement per frame — getBoundingClientRect forces a
    // sync layout flush, so measuring every scroll event caused dozens of reflows.
    let frame = null;

    const measure = () => {
      frame = null;
      setShowScrollTop(window.scrollY > 400);

      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const absoluteTop = top + window.scrollY;
          const absoluteBottom = bottom + window.scrollY;
          if (
            scrollPosition >= absoluteTop &&
            scrollPosition < absoluteBottom
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    const handleScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    // passive: this listener never calls preventDefault.
    window.addEventListener("scroll", handleScroll, { passive: true });
    measure(); // sync the highlight to the restored scroll position
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [sections]);

  const activeSectionTitle =
    sections.find((s) => s.id === activeSection)?.title ||
    sections[0]?.title ||
    "";

  return (
    <>
      

      {/* A <div>, not <main>: PublicLayout already renders the <main> landmark. */}
      <div className="min-h-screen bg-bg-subtle pb-20 leading-[1.7] text-text-body print:bg-card print:p-0">
        {/* decorative radial wash, held behind content via isolate + z-index */}
        <section className="relative isolate overflow-hidden border-b border-brand-400/20 bg-[linear-gradient(135deg,rgba(115,165,239,0.1)_0%,rgba(255,255,255,0)_100%)] bg-bg-page px-8 pt-32 pb-20 text-center before:pointer-events-none before:absolute before:-top-1/2 before:-left-1/2 before:-z-1 before:h-[200%] before:w-[200%] before:bg-[radial-gradient(circle,rgba(115,165,239,0.05)_0%,transparent_60%)] before:content-[''] max-lg:px-6 max-lg:pt-24 max-lg:pb-16 print:border-b-2 print:border-text-main print:bg-none print:px-0 print:py-8 print:text-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-[clamp(1.875rem,1.5rem_+_1.9vw,3rem)] tracking-[-0.02em] text-text-main print:text-[24pt]">
              {title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="inline-block rounded-full border border-brand-400/30 bg-brand-400/10 px-5 py-[0.6rem] text-base font-semibold tracking-[0.05em] text-brand-400 uppercase shadow-[0_4px_12px_rgba(0,0,0,0.02)] backdrop-blur-[8px] print:hidden">
                ⏱ {t("chrome.readTime", { count: readTime })}
              </span>

              {/* Font-size control, disabled. changeFontSize/handlePrint are its
                  only callers, kept so un-commenting restores it. */}
              {/* <div
                className="inline-flex overflow-hidden rounded-full border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.05)] print:hidden [&_button]:cursor-pointer [&_button]:border-none [&_button]:bg-transparent [&_button]:px-4 [&_button]:py-[0.6rem] [&_button]:text-sm [&_button]:font-bold [&_button]:text-text-muted [&_button]:transition-all [&_button:not(:last-child)]:border-e [&_button:not(:last-child)]:border-border [&_button:hover:not(:disabled)]:bg-neutral-100 [&_button:hover:not(:disabled)]:text-brand-400 [&_button:disabled]:opacity-40"
                title="Adjust Text Size"
              >
                <button
                  onClick={() => changeFontSize(-1)}
                  disabled={fontSizeLevel === 0}
                  aria-label="Decrease font size"
                >
                  A-
                </button>
                <button
                  onClick={() => changeFontSize(1)}
                  disabled={fontSizeLevel === 2}
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div> */}

              {/* <button
                className="inline-flex items-center rounded-full border-none bg-brand-400 px-5 py-[0.6rem] text-base font-semibold tracking-[0.05em] text-white uppercase shadow-[0_4px_12px_rgba(115,165,239,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(115,165,239,0.4)] motion-reduce:hover:translate-y-0 print:hidden"
                onClick={handlePrint}
              >
                <PrintIcon /> Download PDF
              </button> */}
            </div>
          </motion.div>
        </section>

        <div
          className={cn(
            "relative z-10 mx-auto -mt-8 grid grid-cols-[280px_1fr] items-start gap-16 px-8",
            "max-w-content max-lg:mt-0 max-lg:grid-cols-1 max-lg:gap-8 max-md:p-2",
            "print:m-0 print:block print:p-0",
            sidebarCollapsed && !isMobile && "max-w-[900px] grid-cols-1",
          )}
        >
          {!isMobile && !sidebarCollapsed && (
            <aside className={SIDEBAR}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[1.15rem] font-bold tracking-[0.08em] text-text-main uppercase">
                  {t("chrome.contents")}
                </h2>
                <button
                  className="flex cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-2 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-brand-400"
                  onClick={() => setSidebarCollapsed(true)}
                  title={t("chrome.collapseSidebar")}
                >
                  <CollapseIcon />
                </button>
              </div>

              <div className={SEARCH_BOX}>
                <SearchIcon />
                <input
                  type="text"
                  className={SEARCH_INPUT}
                  placeholder={t("chrome.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <nav>
                <ul className="flex list-none flex-col gap-4">
                  {filteredSections.map((section) => (
                    <li key={`nav-${section.id}`}>
                      <button
                        className={cn(
                          "block w-full cursor-pointer rounded-[10px] border-none px-4 py-[0.6rem] text-start text-base no-underline transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
                          activeSection === section.id && !searchQuery
                            ? "bg-brand-400 font-medium text-white shadow-[0_4px_10px_rgba(115,165,239,0.3)] translate-x-1.5"
                            : "bg-transparent text-neutral-500 hover:translate-x-1 hover:bg-brand-400/8 hover:text-neutral-700",
                          "motion-reduce:transform-none motion-reduce:hover:transform-none",
                        )}
                        onClick={() => scrollToSection(section.id)}
                        type="button"
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                  {filteredSections.length === 0 && (
                    <li className="py-4 text-center text-sm text-neutral-500 italic">
                      {t("chrome.noMatches")}
                    </li>
                  )}
                </ul>
              </nav>
            </aside>
          )}

          <motion.div
            className={CONTENT_AREA}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {!isMobile && sidebarCollapsed && (
              <button
                className="mb-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-border bg-bg-subtle px-4 py-2 font-semibold text-text-muted transition-all hover:border-brand-400 hover:bg-card hover:text-brand-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] print:hidden"
                onClick={() => setSidebarCollapsed(false)}
                title={t("chrome.expandSidebar")}
              >
                <ExpandIcon /> {t("chrome.contents")}
              </button>
            )}

            <AnimatePresence>
              {isMobile && showScrollTop && !searchQuery && (
                <motion.div
                  className="fixed top-20 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-full border border-border bg-white/95 px-5 py-2 text-sm font-semibold text-ellipsis whitespace-nowrap text-neutral-700 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-[8px] print:hidden [&_span]:me-1 [&_span]:text-brand-400"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <span>{t("chrome.reading")}</span>{" "}
                  {activeSectionTitle.replace(/^\d+\.\s*/, "")}
                </motion.div>
              )}
            </AnimatePresence>

            {isMobile && (
              <div className={cn(SEARCH_BOX, "mb-8 print:hidden")}>
                <SearchIcon />
                <input
                  type="text"
                  className={SEARCH_INPUT}
                  placeholder={t("chrome.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {isLocale(urlLang) && urlLang !== DEFAULT_LOCALE && (
              <p className="mb-8 rounded-md border border-border bg-bg-subtle px-5 py-4 text-sm leading-relaxed text-text-muted">
                <Trans
                  t={t}
                  i18nKey="chrome.translationNotice"
                  components={{
                    en: (
                      <Link
                        to={pathname.replace(/^\/[^/]+/, `/${DEFAULT_LOCALE}`)}
                        className="font-semibold text-brand-600 underline underline-offset-2"
                      />
                    ),
                  }}
                />
              </p>
            )}

            <p className="mb-16 border-s-4 border-brand-400 ps-6 text-xl leading-[1.8] text-text-muted italic">
              {intro}
            </p>

            {filteredSections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="mb-4 scroll-mt-28 rounded-lg p-4 transition-colors duration-300 hover:bg-bg-subtle print:mb-8 print:break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.1, 0.3),
                }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2
                    className={cn(
                      "relative m-0 text-text-main transition-colors duration-200",
                      TITLE_LEVEL[fontSizeLevel],
                      // lg-down forces 1.6rem regardless of level
                      "max-lg:w-full max-lg:text-[1.6rem]",
                      "print:text-[18pt] print:text-text-main",
                    )}
                  >
                    {section.title}
                  </h2>
                </div>

                <div
                  className={cn("overflow-hidden", PROSE, FONT_LEVEL[fontSizeLevel])}
                >
                  {section.content}
                </div>
              </motion.section>
            ))}

            {filteredSections.length > 0 && (
              <div className="mt-20 border-t border-border pt-12 text-center print:hidden">
                <p className="mb-6 text-[1.2rem] text-neutral-700">
                  {t("chrome.feedbackPrompt")}
                </p>
                <div className="flex justify-center gap-4">
                  {[
                    { key: "yes", label: t("chrome.feedbackYes"), helpful: true },
                    { key: "no", label: t("chrome.feedbackNo"), helpful: false },
                  ].map(({ key, label, helpful }) => (
                    <button
                      key={key}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full border px-6 py-2 text-base transition-all",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        feedbackGiven === key
                          ? "border-brand-400 bg-brand-400 text-white"
                          : "border-border bg-card text-text-muted hover:not-disabled:-translate-y-0.5 hover:not-disabled:border-neutral-300 hover:not-disabled:bg-bg-subtle",
                        "motion-reduce:hover:not-disabled:translate-y-0",
                      )}
                      onClick={() => handleFeedback(helpful)}
                      disabled={feedbackGiven !== null}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed end-8 bottom-8 z-100 flex size-12.5 cursor-pointer items-center justify-center rounded-full border-none bg-brand-400 text-white shadow-[0_4px_15px_rgba(115,165,239,0.4)] max-md:end-6 max-md:bottom-6 max-md:size-11.25 print:hidden"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.9 }}
            aria-label={t("chrome.backToTop")}
          >
            <UpArrowIcon />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
