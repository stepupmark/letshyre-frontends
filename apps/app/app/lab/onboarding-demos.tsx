import { Button } from "@workspace/ui/components/button"
import { FileBadge, ImageIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { FileDropzone } from "@/components/file-dropzone"
import { Stepper } from "@/components/stepper"
import {
  EMPTY_RESUME,
  ProfilePreview,
  type CandidateStep,
  type CandidateValues,
} from "@/features/candidate-onboarding"
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

const CANDIDATE_STEPS: CandidateStep[] = [
  "you",
  "photo",
  "work",
  "documents",
  "resume",
  "review",
]

export function CandidatePreviewDemo() {
  const [step, setStep] = useState<CandidateStep>("you")
  const form = useForm<CandidateValues>({
    defaultValues: {
      aadhar_number: "2345 6789 0124",
      address_city: "Kochi",
      address_state: "Kerala",
      current_ctc: "12",
      expected_ctc: "16",
      desired_ctc: "18",
      preferred_industry: "Information technology",
      preferred_locations: ["Kochi", "Bengaluru"],
    },
  })
  const resume = {
    ...EMPTY_RESUME,
    role: "Frontend Developer",
    review: {
      skills: ["React", "TypeScript", "CSS", "Accessibility"],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    },
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">Candidate onboarding preview</h2>
      <div className="flex flex-wrap gap-2">
        {CANDIDATE_STEPS.map((id) => (
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
        <ProfilePreview
          control={form.control}
          resume={resume}
          name="Asha Menon"
          step={step}
        />
      </div>
    </section>
  )
}
