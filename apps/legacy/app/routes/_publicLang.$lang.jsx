import { useEffect } from "react";
import { matchPath, useNavigation, useParams } from "react-router";
import { I18nextProvider } from "react-i18next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { NotFound } from "@/features/not-found/NotFound";
import { PricingSkeleton } from "@/features/pricing/components/PricingSkeleton";
import { useDelayedPending } from "@/hooks/useDelayedPending";
import { isLocale } from "@/i18n/config";
import { getI18n } from "@/i18n/i18n";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["common", "seo"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

// Skeletons for pages whose code and copy load on navigation. The destination
// module isn't loaded yet, so they have to be known up front.
const PENDING = [{ path: "/:lang/pricing", element: <PricingSkeleton /> }];

function usePendingSkeleton() {
  const navigation = useNavigation();
  const delayed = useDelayedPending();
  if (!delayed || navigation.state !== "loading") return null;
  const target = navigation.location.pathname;
  return PENDING.find((entry) => matchPath(entry.path, target))?.element ?? null;
}

export default function LocalePublicLayout() {
  const { lang } = useParams();
  const skeleton = usePendingSkeleton();

  useEffect(() => {
    if (skeleton) window.scrollTo(0, 0);
  }, [skeleton]);

  if (!isLocale(lang)) return <NotFound />;

  return (
    <I18nextProvider i18n={getI18n(lang)}>
      <PublicLayout pending={skeleton} />
    </I18nextProvider>
  );
}
