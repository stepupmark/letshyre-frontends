import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { BadgeCheck, Globe, Link2, MapPin } from "lucide-react"
import { useWatch, type Control } from "react-hook-form"

import { FileImage } from "@/components/file-image"
import { initialsOf } from "@/lib/format"
import { industriesQuery } from "@/lib/industries"

import type { Values } from "../../schemas/onboarding-form.schema"

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** The company as candidates will see it, filling in while the form is typed. */
export function CompanyCard({ control }: { control: Control<Values> }) {
  const { t } = useTranslation("onboarding")
  const industries = useQuery(industriesQuery())
  const [name, industry, description, website, linkedin, city, state, logo] =
    useWatch({
      control,
      name: [
        "company_name",
        "company_industry",
        "company_description",
        "company_website",
        "linkedin_url",
        "address_city",
        "address_state",
        "company_logo",
      ],
    })
  const industryLabel = industries.data?.find(
    (item) => item.value === industry
  )?.label

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-muted text-base font-semibold text-brand-text">
          {logo instanceof File && logo.type.startsWith("image/") ? (
            <FileImage file={logo} className="pop size-full object-cover" />
          ) : (
            initialsOf(name) || (
              <span className="size-5 rounded-sm bg-brand/25" />
            )
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {name.trim() ? (
            <p className="flex items-center gap-1.5 truncate font-semibold motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1">
              <span className="truncate">{name}</span>
              <BadgeCheck className="size-4 shrink-0 text-muted-foreground/60" />
            </p>
          ) : (
            <span className="h-3 w-32 rounded-full bg-muted-foreground/20" />
          )}
          {industryLabel ? (
            <span className="w-fit rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1">
              {industryLabel}
            </span>
          ) : (
            <span className="h-2.5 w-20 rounded-full bg-muted-foreground/15" />
          )}
        </div>
      </div>

      {description.trim() ? (
        <p className="line-clamp-3 text-sm text-pretty text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1">
          {description}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="h-2.5 w-full rounded-full bg-muted-foreground/15" />
          <span className="h-2.5 w-4/5 rounded-full bg-muted-foreground/15" />
          <span className="h-2.5 w-3/5 rounded-full bg-muted-foreground/15" />
        </div>
      )}

      <ul className="flex flex-col gap-2 border-t pt-4 text-sm">
        <Detail icon={Globe} value={website && host(website)} />
        <Detail icon={Link2} value={linkedin && host(linkedin)} />
        <Detail
          icon={MapPin}
          value={[city, state].filter((part) => part.trim()).join(", ")}
        />
      </ul>
      <p className="text-xs text-muted-foreground">
        {t("preview.company.caption")}
      </p>
    </div>
  )
}

function Detail({ icon: Icon, value }: { icon: typeof Globe; value: string }) {
  return (
    <li className="flex min-w-0 items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      {value ? (
        <span className="truncate text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1">
          {value}
        </span>
      ) : (
        <span className="h-2.5 w-28 rounded-full bg-muted-foreground/15" />
      )}
    </li>
  )
}
