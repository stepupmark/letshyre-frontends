import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function PublicLayout({ pending }) {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Keyboard/screen-reader skip link: hidden until focused, then jumps past
          the nav to <main>. First focusable element on every public page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-md focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        {t("skipToContent")}
      </a>
      <Navbar />
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-[calc(100vh-360px)] flex-col focus:outline-none"
      >
        {pending || <Outlet />}
      </main>
      <Footer />
    </>
  );
}
