import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { PencilLine } from "lucide-react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { industriesQuery } from "@/lib/industries"

import type { StepId, Values } from "../../schemas/onboarding-form.schema"

/** What's about to be sent, with a way back to each part. */
export function ReviewSummary({
  form,
  onEdit,
}: {
  form: UseFormReturn<Values>
  onEdit: (step: StepId) => void
}) {
  const { t } = useTranslation("onboarding")
  const industries = useQuery(industriesQuery())
  const values = useWatch({ control: form.control })
  const industry =
    industries.data?.find((item) => item.value === values.company_industry)
      ?.label ?? values.company_industry

  const groups: {
    step: StepId
    title: string
    rows: [string, string | undefined][]
  }[] = [
    {
      step: "company",
      title: t("steps.company"),
      rows: [
        [t("fields.companyName"), values.company_name],
        [t("fields.industry"), industry],
        [t("fields.website"), values.company_website],
        [t("fields.officialEmail"), values.official_email],
      ],
    },
    {
      step: "legal",
      title: t("steps.legal"),
      rows: [
        [t("fields.registration"), values.company_registration_number],
        [t("fields.pan"), values.pan_number],
        [t("fields.gst"), values.gst_number],
        [t("fields.address"), values.company_address],
      ],
    },
  ]

  return (
    <section
      aria-labelledby="review-heading"
      className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:p-5"
    >
      <h3 id="review-heading" className="text-base font-semibold">
        {t("review.heading")}
      </h3>
      {groups.map((group) => (
        <div key={group.step} className="flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-medium">{group.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("review.editLabel", { section: group.title })}
              onClick={() => {
                onEdit(group.step)
              }}
            >
              <PencilLine />
              {t("review.edit")}
            </Button>
          </div>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {group.rows.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate font-medium">
                  {value?.trim() ? value : "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  )
}
