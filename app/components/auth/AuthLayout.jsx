import { Trans, useTranslation } from "react-i18next";
import { AuthShell } from "./AuthShell";

/**
 * Login layout — the two-pane shell with a two-tone "<Role> Login" title.
 * On mobile the illustration is hidden and only the card is shown.
 *
 * @param {{
 *   image: string,
 *   roleLabel: string,
 *   children: React.ReactNode,
 *   imageFit?: "cover" | "contain",
 * }} props
 *   roleLabel — already-localized role noun; the accent word order lives in the
 *   translation so RTL/reordering is the translator's call.
 *   imageFit  — "contain" (default) for illustrations, "cover" for photos.
 */
export function AuthLayout({ image, roleLabel, children, imageFit = "contain" }) {
  const { t } = useTranslation("auth");
  return (
    <AuthShell image={image} imageFit={imageFit}>
      <h1 className="mt-0 mb-8 text-center text-[clamp(1.5rem,1.3rem_+_1vw,1.875rem)] leading-[1.2] font-extrabold text-text-main">
        <Trans
          t={t}
          i18nKey="login.title"
          values={{ role: roleLabel }}
          components={{ accent: <span className="text-brand-600" /> }}
        />
      </h1>
      {children}
    </AuthShell>
  );
}
