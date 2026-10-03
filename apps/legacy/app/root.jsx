import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { GlobalLoader } from "./components/loading/GlobalLoader";
import { RootLayout } from "./components/layout/RootLayout";
import { AppLocaleProvider } from "@/i18n/AppLocaleProvider";
import { DEFAULT_LOCALE, dirFor, isLocale } from "@/i18n/config";
import { SITE } from "@/lib/seo";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { metaPixelSnippet } from "@/lib/metaPixel";

import "./styles/tailwind.css";

import "./styles/fonts.css";
import "./styles/global.css";
import "./styles/typeset.css";

export function Layout({ children }) {
  // Locale lives in the first path segment (/en/about); the document tag mirrors
  // it so lang/dir are correct at prerender and after client navigation.
  const seg = useLocation().pathname.split("/")[1];
  const hasLocale = isLocale(seg);
  const lang = hasLocale ? seg : DEFAULT_LOCALE;
  const pixel = metaPixelSnippet();
  return (
    <html lang={lang} dir={dirFor(lang)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Site-wide tags; per-page title/description/OG come from each route's meta(). */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="LetsHyre" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Hosting rewrites every client-rendered URL (/employee, /employer,
            /shared-scorecard, auth) to this one shell, and link-preview bots
            don't run JS, so they never reach the route's own meta. A single
            static card stands in; being one shared file, it can't vary per
            page or per locale. Prerendered pages carry their own OG tags. */}
        {!hasLocale && (
          <>
            {/* Every indexable page lives under /:lang. This shell also answers
                unknown URLs with a 200, so keep it out of the index. */}
            <meta name="robots" content="noindex, follow" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE.name} />
            <meta property="og:title" content="LetsHyre — AI Hiring Platform" />
            <meta
              property="og:description"
              content="Screen resumes, run structured AI interviews, and verify candidates in one place."
            />
            <meta property="og:image" content={SITE.defaultOg} />
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="535" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={SITE.defaultOg} />
          </>
        )}
        <Meta />
        <Links />
        {pixel && <script dangerouslySetInnerHTML={{ __html: pixel }} />}
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Offset clears the navbars: hovering a toast pauses it, and the
              top-right corner is where their buttons sit. */}
          <Toaster
            position="top-right"
            offset={{ top: 88 }}
            mobileOffset={{ top: 80 }}
            richColors
            closeButton
          />
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useMetaPixel();

  return (
    <AppLocaleProvider>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </AppLocaleProvider>
  );
}

export function HydrateFallback() {
  return <GlobalLoader />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let detail =
    "An unexpected error occurred. Please try again, or head back to the homepage.";

  if (isRouteErrorResponse(error)) {
    title =
      error.status === 404
        ? "Page not found"
        : `${error.status} ${error.statusText}`;
    detail =
      error.status === 404
        ? "The page you're looking for doesn't exist or may have moved."
        : error.data || detail;
  } else if (import.meta.env.DEV && error instanceof Error) {
    detail = error.message;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[34rem] rounded-xl bg-white p-10 text-center shadow-[0_1px_3px_rgb(15_23_42/12%)]">
        <p className="mb-3 text-xs font-bold tracking-[0.08em] text-blue-600 uppercase">
          LetsHyre
        </p>
        <h1 className="mb-3 text-2xl leading-snug text-slate-900">{title}</h1>
        <p className="mb-7 text-slate-600">{detail}</p>
        <a
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white no-underline hover:bg-blue-700"
          href="/"
        >
          Back to homepage
        </a>
        {import.meta.env.DEV && error instanceof Error && error.stack ? (
          <pre className="mt-7 overflow-x-auto rounded-lg bg-slate-900 p-4 text-start text-xs whitespace-pre-wrap text-slate-200">
            {error.stack}
          </pre>
        ) : null}
      </div>
    </main>
  );
}
