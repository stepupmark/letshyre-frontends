import { z } from "zod"

import { joinAddress as join } from "@/lib/address"
import { CIN, GSTIN, isLinkedIn, PAN, PIN_CODE } from "@/lib/company-ids"
import type { FileRules } from "@/lib/file-rules"
import { checkFile } from "@/lib/file-rules"

const MAX = 5 * 1024 * 1024

const IMAGE: FileRules = {
  accept: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: MAX,
}
const DOCUMENT: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: MAX,
}

export const STEPS = {
  company: [
    "company_name",
    "company_website",
    "official_email",
    "company_industry",
    "linkedin_url",
    "company_description",
  ],
  legal: [
    "company_registration_number",
    "pan_number",
    "gst_number",
    "address_line",
    "address_city",
    "address_state",
    "address_pin",
  ],
  documents: ["company_logo", "registration_certificate", "gst_certificate"],
} as const

export type StepId = keyof typeof STEPS
type TextField = (typeof STEPS)["company" | "legal"][number]
export type FileField = (typeof STEPS)["documents"][number]

export const DOCUMENTS: { name: FileField; rules: FileRules }[] = [
  { name: "company_logo", rules: IMAGE },
  { name: "registration_certificate", rules: DOCUMENT },
  { name: "gst_certificate", rules: DOCUMENT },
]

type Messages = Record<
  | "nameRequired"
  | "nameMin"
  | "websiteRequired"
  | "website"
  | "emailRequired"
  | "email"
  | "industry"
  | "linkedinRequired"
  | "linkedin"
  | "linkedinDomain"
  | "descriptionRequired"
  | "description"
  | "registrationRequired"
  | "registration"
  | "panRequired"
  | "pan"
  | "gstRequired"
  | "gst"
  | "addressRequired"
  | "address"
  | "cityRequired"
  | "city"
  | "stateRequired"
  | "state"
  | "pinRequired"
  | "pin"
  | "fileRequired"
  | "fileInvalid",
  string
>

export const makeSchema = (m: Messages) => {
  const file = (rules: FileRules) =>
    z
      .custom<File>((value) => value instanceof File, m.fileRequired)
      .refine((value) => checkFile(value, rules) === null, m.fileInvalid)
  // the required message comes first, so an empty field never shows the format one
  const filled = (required: string) => z.string().trim().min(1, required)

  return z.object({
    company_name: filled(m.nameRequired).min(2, m.nameMin).max(100),
    company_website: filled(m.websiteRequired).pipe(z.url(m.website)),
    official_email: filled(m.emailRequired).pipe(z.email(m.email)),
    company_industry: z.string().min(1, m.industry),
    linkedin_url: filled(m.linkedinRequired).pipe(
      z.url(m.linkedin).refine(isLinkedIn, m.linkedinDomain)
    ),
    company_description: filled(m.descriptionRequired)
      .min(200, m.description)
      .max(500),
    company_registration_number: filled(m.registrationRequired).regex(
      CIN,
      m.registration
    ),
    pan_number: filled(m.panRequired).regex(PAN, m.pan),
    gst_number: filled(m.gstRequired).regex(GSTIN, m.gst),
    address_line: filled(m.addressRequired).min(5, m.address),
    address_city: filled(m.cityRequired).min(2, m.city),
    address_state: filled(m.stateRequired).min(2, m.state),
    address_pin: filled(m.pinRequired).regex(PIN_CODE, m.pin),
    company_logo: file(IMAGE),
    registration_certificate: file(DOCUMENT),
    gst_certificate: file(DOCUMENT),
  })
}

export type Schema = ReturnType<typeof makeSchema>
export type Values = z.infer<Schema>
export type Draft = Pick<Values, TextField>

/** The part of the schema one step covers. */
export const stepSchema = (schema: Schema, step: StepId) => {
  const mask: Partial<Record<keyof Values, true>> = {}
  for (const key of STEPS[step]) mask[key] = true
  return schema.pick(mask)
}

export const joinAddress = (values: Partial<Values>) =>
  join({
    line: values.address_line,
    city: values.address_city,
    state: values.address_state,
    pin: values.address_pin,
  })
