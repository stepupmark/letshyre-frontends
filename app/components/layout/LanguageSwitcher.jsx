import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { LanguageMenu } from "@/components/common/LanguageMenu";
import { isLocale, localesForPage } from "@/i18n/config";
import { persistLocale } from "@/i18n/hooks";
import { useAppLocale } from "@/i18n/appLocale";
import { showError, showInfo } from "@/lib/toast";

export function LanguageSwitcher(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang: urlLang } = useParams();
  const { locale: appLocale, setLocale: setAppLocale } = useAppLocale();
  const current = isLocale(urlLang) ? urlLang : appLocale;
  const { t } = useTranslation();

  const switchTo = (lang) => {
    if (lang === current) return;
    if (!isLocale(urlLang)) {
      setAppLocale(lang).catch(() => showError(t("nav.languageFailed")));
      return;
    }
    persistLocale(lang);
    const rest = location.pathname.replace(/^\/[^/]+/, "");
    if (!localesForPage(rest).includes(lang)) {
      showInfo(t("nav.englishOnly"));
      return;
    }
    navigate(`/${lang}${rest}${location.hash}`);
  };

  return <LanguageMenu current={current} onSelect={switchTo} {...props} />;
}
