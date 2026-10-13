import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { UseFormReturn } from "react-hook-form"

import { duration, ease } from "@/lib/motion"

import type { StepId, Values } from "../../schemas/onboarding-form.schema"
import { CompanyCard } from "./company-card"
import { DocumentsCard } from "./documents-card"
import { VerifyCard } from "./verify-card"

/** Mirrors the form, so it's hidden from assistive tech. */
export function OnboardingPreview({
  form,
  step,
}: {
  form: UseFormReturn<Values>
  step: StepId
}) {
  return (
    <aside aria-hidden="true" className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,var(--brand-muted),transparent_65%)]" />
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={step}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: duration.slow, ease }}
        >
          {step === "company" && <CompanyCard control={form.control} />}
          {step === "legal" && <VerifyCard form={form} />}
          {step === "documents" && <DocumentsCard control={form.control} />}
        </m.div>
      </AnimatePresence>
    </aside>
  )
}
