import { useTranslation } from "react-i18next";
import sc_bg from "@/assets/scorecard-bg.webp";
import { avatarFallback } from "@/features/candidate-profile/components/utils";


/**
 * The profile card (photo + name/role overlay) paired with the overall-score
 * card. Photo falls back to a generated avatar when none is set.
 */
export function PerformanceSummary({ name, role, photo, score, questionCount }) {
  const { t } = useTranslation("scorecard");
  const src = photo || avatarFallback(name);
  const pct = Math.round(score || 0);
  const candidate = t("summary.candidate");

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.7fr_1fr]">
      <div className="relative min-h-55 overflow-hidden rounded-lg bg-brand-100 shadow-sm">
        <img
          src={src}
          alt={name || candidate}
          className="block h-full min-h-55 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = avatarFallback(name);
          }}
        loading="lazy" decoding="async" />
        <div className="absolute inset-x-0 top-auto bottom-0 bg-gradient-to-t from-text-main/72 via-text-main/35 to-transparent p-4 text-text-white">
          <h3 className="m-0 text-lg font-bold text-text-white">{name || candidate}</h3>
          {role && <p className="mt-1 mb-0 text-sm capitalize opacity-90">{role}</p>}
        </div>
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-text-white shadow-sm">
        <div className="text-5xl leading-none font-bold">{pct}%</div>
        <div className="mt-3 text-lg font-semibold text-text-white/92">{t("summary.overall")}</div>
        <p className="mt-2 mb-0 text-sm text-text-white/80">
          {t("summary.basedOn", { count: questionCount })}
        </p>
        <div className="pointer-events-none absolute -top-5 -end-12.5 size-47.5 opacity-90 [&_img]:w-full" aria-hidden="true">
          <img src={sc_bg} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  );
}

export default PerformanceSummary;
