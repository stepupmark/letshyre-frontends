import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageMenu } from "@/components/common/LanguageMenu";
import { useAppLocale } from "@/i18n/appLocale";
import { showError } from "@/lib/toast";

// Auth and dashboard routes have no /:lang segment, so this switches the locale in place.
export function AppLanguageSwitcher(props) {
  const { locale, setLocale } = useAppLocale();
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);

  const select = (lang) => {
    if (pending || lang === locale) return;
    setPending(true);
    setLocale(lang)
      .catch(() => showError(t("nav.languageFailed")))
      .finally(() => setPending(false));
  };

  return <LanguageMenu current={locale} onSelect={select} pending={pending} {...props} />;
}
