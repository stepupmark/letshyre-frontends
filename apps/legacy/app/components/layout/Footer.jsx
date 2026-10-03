import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, localePath, localesForPage } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { StayUpdatedForm } from "@/components/common/StayUpdatedForm";
import { BIcon } from "@/components/icons/BootstrapIcons";
import footer_logo from "@/assets/footer-logo.png";

const STAGGER = [
  "md:[animation-delay:0.1s]",
  "md:[animation-delay:0.25s]",
  "md:[animation-delay:0.4s]",
  "md:[animation-delay:0.55s]",
];

const HEADING_GRADIENT =
  "bg-[linear-gradient(130deg,var(--color-brand-400)_0%,var(--color-brand-400)_20%,var(--color-bg-page)_50%)] bg-clip-text text-transparent";

const TITLE = cn(HEADING_GRADIENT, "mb-3 text-base font-semibold");
const DESC = "text-sm leading-[1.5] text-neutral-300";
const LINK_ITEM =
  "text-sm text-border transition-colors hover:text-brand-400 focus-visible:rounded-sm focus-visible:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

const SOCIAL_ICON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/6 text-base text-neutral-400 no-underline transition-all duration-200 ease-in-out hover:-translate-y-[3px] hover:bg-white/15 hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] motion-reduce:hover:translate-y-0";

const SOCIALS = [
  { href: "https://wa.me/919346708639", icon: "whatsapp", label: "WhatsApp" },
  { href: "https://x.com/letshyreAi", icon: "twitter-x", label: "X" },
  {
    href: "https://www.linkedin.com/company/letshyre/",
    icon: "linkedin",
    label: "LinkedIn",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61585708555581",
    icon: "facebook",
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/letshyreofficial/",
    icon: "instagram",
    label: "Instagram",
  },
  {
    href: "https://www.youtube.com/@LetsHyre",
    icon: "youtube",
    label: "YouTube",
  },
];

const PRODUCT_LINKS = [
  { labelKey: "footer.links.interviewProcess", to: "/how-it-works-interview" },
  { labelKey: "footer.links.downloadApp", to: "/download" },
  { labelKey: "footer.links.pricing", to: "/pricing" },
];

const COMPANY_LINKS = [
  { labelKey: "footer.links.about", to: "/about" },
  { labelKey: "footer.links.terms", to: "/terms" },
  { labelKey: "footer.links.privacy", to: "/policy" },
  { labelKey: "footer.links.refund", to: "/refund-policy" },
  { labelKey: "footer.links.contact", to: "/contact" },
];

export function Footer() {
  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const lang = useLocale();
  // Pages missing in this locale (English-only for now) link to the default one.
  const hrefFor = (to) =>
    localePath(localesForPage(to).includes(lang) ? lang : DEFAULT_LOCALE, to);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const column = (i) =>
    cn(
      "flex-[1_1_180px] min-w-[180px] md:opacity-0 md:-translate-x-[50px] max-md:min-w-auto max-md:flex-none",
      visible && "md:animate-ft-move",
      visible && STAGGER[i],
    );

  return (
    <footer
      className="relative w-full overflow-hidden bg-text-main px-5 text-border sm:px-6 md:px-10 lg:px-13 xl:px-16 2xl:px-18 3xl:px-24 print:hidden"
      ref={footerRef}
    >
      <div className="relative z-2 flex flex-wrap justify-between gap-10 py-[5%] pb-0 max-md:flex-col max-md:gap-[30px] max-md:pb-[2%]">
        <div className={column(0)}>
          <h2
            className={cn(HEADING_GRADIENT, "mb-2.5 w-full text-xl font-bold")}
          >
            LetsHyre
          </h2>
          <p className={DESC}>{t("footer.tagline")}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_ICON}
                aria-label={s.label}
              >
                <BIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={t("footer.product")} className={column(1)}>
          <h3 className={TITLE}>{t("footer.product")}</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.labelKey}>
                <Link to={hrefFor(l.to)} className={LINK_ITEM}>
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.company")} className={column(2)}>
          <h3 className={TITLE}>{t("footer.company")}</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {COMPANY_LINKS.map((l) => (
              <li key={l.labelKey}>
                <Link to={hrefFor(l.to)} className={LINK_ITEM}>
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={column(3)}>
          <h3 className={TITLE}>{t("footer.stayUpdated")}</h3>
          <p className={DESC}>{t("footer.newsletterDesc")}</p>

          <StayUpdatedForm />
        </div>
      </div>

      <div className="mt-5 flex w-full justify-center">
        <img
          src={footer_logo}
          className="mb-2.5 w-full"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    </footer>
  );
}
