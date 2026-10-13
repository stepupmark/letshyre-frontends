import { useTranslation } from "@workspace/i18n/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ChevronDown, Eye } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import type { StepId, Values } from "../../schemas/onboarding-form.schema"
import { OnboardingPreview } from "./onboarding-preview"

/** The side preview, folded away above the form on smaller screens. */
export function MobilePreview({
  form,
  step,
}: {
  form: UseFormReturn<Values>
  step: StepId
}) {
  const { t } = useTranslation("onboarding")

  return (
    <Collapsible className="overflow-hidden rounded-xl border lg:hidden">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Eye className="size-4 text-muted-foreground" />
        <span className="group-aria-expanded:hidden">{t("preview.show")}</span>
        <span className="hidden group-aria-expanded:inline">
          {t("preview.hide")}
        </span>
        <ChevronDown className="ms-auto size-4 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-1 pb-4">
        <OnboardingPreview form={form} step={step} />
      </CollapsibleContent>
    </Collapsible>
  )
}
