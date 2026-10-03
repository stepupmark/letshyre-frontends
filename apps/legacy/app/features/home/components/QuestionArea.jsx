import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reveal } from "./reveal";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const ITEM =
  "w-full rounded-[14px] border border-border bg-bg-card transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.06)] motion-reduce:hover:translate-y-0";

const ITEM_ACTIVE =
  "border-brand-600 bg-brand-100 shadow-[0_4px_16px_rgba(37,99,235,0.08)]";

const ICON_WRAP =
  "h-6 w-6 shrink-0 text-text-muted transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]";

export function QuestionArea() {
  const { t } = useTranslation("home");
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const faqs = t("faq.items", { returnObjects: true });
  return (
    <motion.section
      className="w-full bg-bg-subtle px-5 py-20 sm:px-6 md:px-10 lg:px-13 xl:px-16 2xl:px-18 3xl:px-24 max-md:py-[60px]"
      {...reveal()}
    >
      <div className="mx-auto w-full max-w-[1178px]">
        <header className="mb-[35px] text-center">
          <span>{t("faq.eyebrow")}</span>
          <h2>{t("faq.title")}</h2>
          <p>{t("faq.subtitle")}</p>
        </header>

        <div className="flex w-full flex-col gap-[14px]">
          {faqs.map((item, index) => (
            <div
              className={cn(ITEM, activeIndex === index && ITEM_ACTIVE)}
              key={index}
            >
              <button
                className="flex w-full cursor-pointer items-center justify-between border-none bg-none px-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 max-md:px-4 max-md:py-5"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                <span className="text-start text-[1.1rem] leading-[1.4] font-semibold text-text-main max-md:text-base">
                  {item.q}
                </span>
                <span
                  className={cn(ICON_WRAP, activeIndex === index && "text-brand-600")}
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M5 12h14" />
                    <motion.path
                      d="M12 5v14"
                      animate={{ opacity: activeIndex === index ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[90%] px-6 pt-0 pb-8 text-[1.05rem] leading-[1.8] text-text-muted">
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
