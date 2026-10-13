import { Button } from "@workspace/ui/components/button"
import { FileBadge, ImageIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { FileDropzone } from "@/components/file-dropzone"
import { Stepper } from "@/components/stepper"
import {
  OnboardingPreview,
  type OnboardingStep,
  type OnboardingValues,
} from "@/features/employer-onboarding"

const STEPS: OnboardingStep[] = ["company", "legal", "documents"]

export function StepperDemo() {
  const [current, setCurrent] = useState(1)
  return (
    <section className="flex max-w-xl flex-col gap-3">
      <h2 className="text-base font-medium">Stepper</h2>
      <Stepper
        titles={["Company details", "Registration and tax", "Documents"]}
        current={current}
        onSelect={setCurrent}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          setCurrent((i) => (i + 1) % 3)
        }}
      >
        Next step
      </Button>
    </section>
  )
}

export function UploadRowsDemo() {
  return (
    <section className="flex max-w-xl flex-col gap-3">
      <h2 className="text-base font-medium">FileDropzone, row layout</h2>
      <div className="divide-y overflow-hidden rounded-xl border">
        <FileDropzone
          layout="row"
          icon={ImageIcon}
          label="Company logo"
          description="Square works best"
          rules={{ accept: [".png", ".jpg"], maxBytes: 5 * 1024 * 1024 }}
        />
        <FileDropzone
          layout="row"
          icon={FileBadge}
          label="Registration certificate"
          rules={{ accept: [".pdf"], maxBytes: 5 * 1024 * 1024 }}
        />
      </div>
    </section>
  )
}

export function OnboardingPreviewDemo() {
  const [step, setStep] = useState<OnboardingStep>("company")
  const form = useForm<OnboardingValues>({
    defaultValues: {
      company_name: "Acme Labs",
      company_industry: "",
      company_description: "We build hiring software for small teams.",
      company_website: "https://acme.in",
      linkedin_url: "",
      address_city: "Hyderabad",
      address_state: "Telangana",
      company_registration_number: "U72900TG2024PTC123456",
      pan_number: "ABCDE1234F",
      gst_number: "",
    },
  })

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">Employer onboarding preview</h2>
      <div className="flex gap-2">
        {STEPS.map((id) => (
          <Button
            key={id}
            size="sm"
            variant={id === step ? "default" : "outline"}
            onClick={() => {
              setStep(id)
            }}
          >
            {id}
          </Button>
        ))}
      </div>
      <div className="max-w-sm">
        <OnboardingPreview form={form} step={step} />
      </div>
    </section>
  )
}
