import { Mail, Phone, MapPin, Briefcase, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatExperience } from "@/features/candidate-profile/components/utils";
import { cn } from "@/lib/utils";

/**
 * Contact details. On desktop this renders as an inline 4-up row with
 * dividers; on mobile/tablet each item becomes a stacked row with a chevron
 * (styling handled in CSS — same markup for both).
 */
export function ContactStrip({ profile }) {
  const { t } = useTranslation("candidateProfile");
  const dash = t("dash");
  const items = [
    {
      key: "email",
      icon: Mail,
      label: t("contact.email"),
      value: profile.email || dash,
      href: profile.email ? `mailto:${profile.email}` : null,
    },
    {
      key: "phone",
      icon: Phone,
      label: t("contact.phone"),
      value: profile.phone_number ? `+91 ${profile.phone_number}` : dash,
      href: profile.phone_number ? `tel:+91${profile.phone_number}` : null,
    },
    {
      key: "location",
      icon: MapPin,
      label: t("contact.location"),
      value: profile.location || profile.address || dash,
    },
    {
      key: "experience",
      icon: Briefcase,
      label: t("contact.experience"),
      value: formatExperience(profile.total_experience_years, t),
    },
  ];

  return (
    <ul className="m-0 flex list-none flex-col px-4 pb-2 lg:flex-row lg:border-t lg:border-border-soft lg:px-8 lg:py-5">
      {items.map(({ key, icon, label, value, href }) => {
        const Icon = icon;
        return (
        <li key={key} className={cn("flex items-center gap-3 border-t border-border-soft px-1 py-3 lg:flex-1 lg:items-start lg:border-t-0 lg:px-5 lg:py-0", "lg:[&+&]:border-s lg:[&+&]:border-border-soft")}>
          <span className="grid size-9.5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600" aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="mb-0.5 hidden text-xs text-text-faint lg:block">{label}</span>
            {href ? (
              <a className="text-sm break-words text-text-body hover:text-brand-600" href={href}>
                {value}
              </a>
            ) : (
              <span className="text-sm break-words text-text-body">{value}</span>
            )}
          </span>
          <ChevronRight
            size={18}
            strokeWidth={2}
            className="shrink-0 text-text-faint lg:hidden"
            aria-hidden="true"
          />
        </li>
        );
      })}
    </ul>
  );
}

export default ContactStrip;
