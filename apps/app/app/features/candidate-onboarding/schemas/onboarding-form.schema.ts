import { z } from "zod"

import { joinAddress as join } from "@/lib/address"
import { PIN_CODE } from "@/lib/company-ids"
import { checkFile, type FileRules } from "@/lib/file-rules"

const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

/** 12 digits, not starting with 0 or 1, with a valid Verhoeff check digit. */
export function isAadhaar(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!/^[2-9]\d{11}$/.test(digits)) return false
  let c = 0
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[digits.length - 1 - i])
    c = D[c]?.[P[i % 8]?.[d] ?? 0] ?? 0
  }
  return c === 0
}

/** 18 or older on `today`. Dates are yyyy-mm-dd, as from a date input. */
export function isAdult(dob: string, today = new Date()) {
  const [y, m, d] = dob.split("-").map(Number)
  if (!y || !m || !d) return false
  const age =
    today.getFullYear() -
    y -
    (today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
      ? 1
      : 0)
  return age >= 18 && age < 100
}

const oneOf = (list: readonly string[], value: string) => list.includes(value)

export const GENDERS = ["Male", "Female", "Other"] as const
export const PROOF_TYPES = ["Relieving Letter", "Offer Letter"] as const

export const PHOTO: FileRules = {
  accept: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 10 * 1024 * 1024,
}
export const DOCUMENT: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: 5 * 1024 * 1024,
}

export const STEPS = {
  you: [
    "gender",
    "dob",
    "aadhar_number",
    "address_line",
    "address_city",
    "address_state",
    "address_pin",
  ],
  photo: ["profile_photo"],
  work: [
    "present_or_last_working_company",
    "last_day_of_working",
    "current_ctc",
    "expected_ctc",
    "preferred_industry",
    "preferred_locations",
  ],
  documents: [
    "resignation_letter",
    "experience_letter",
    "notice_period_proof_type",
    "notice_period_proof",
    "present_offer",
  ],
} as const

export type StepId = keyof typeof STEPS | "resume" | "review"

export const DOCUMENTS = [
  "resignation_letter",
  "experience_letter",
  "notice_period_proof",
  "present_offer",
] as const
export type DocumentField = (typeof DOCUMENTS)[number]
export const REQUIRED_DOCUMENTS = [
  "resignation_letter",
  "experience_letter",
  "notice_period_proof",
] as const
export const FILE_FIELDS = ["profile_photo", ...DOCUMENTS] as const

type Messages = Record<
  | "gender"
  | "dob"
  | "adult"
  | "aadhaar"
  | "address"
  | "city"
  | "state"
  | "pin"
  | "photo"
  | "company"
  | "lastDay"
  | "ctc"
  | "expectedLow"
  | "industry"
  | "locations"
  | "proofType"
  | "file"
  | "fileInvalid",
  string
>

const ctc = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, message)

const payOk = (v: { current_ctc: string; expected_ctc: string }) =>
  Number(v.expected_ctc) >= Number(v.current_ctc)

export const makeSchema = (m: Messages) => {
  const file = (rules: FileRules, message: string) =>
    z
      .instanceof(File, { message })
      .refine((value) => checkFile(value, rules) === null, m.fileInvalid)

  const base = z.object({
    gender: z.string().refine((v) => oneOf(GENDERS, v), m.gender),
    dob: z
      .string()
      .min(1, m.dob)
      .refine((v) => isAdult(v), m.adult),
    aadhar_number: z.string().refine(isAadhaar, m.aadhaar),
    address_line: z.string().trim().min(5, m.address),
    address_city: z.string().trim().min(2, m.city),
    address_state: z.string().trim().min(2, m.state),
    address_pin: z.string().trim().regex(PIN_CODE, m.pin),
    profile_photo: file(PHOTO, m.photo),
    present_or_last_working_company: z.string().trim().min(2, m.company),
    last_day_of_working: z.string().min(1, m.lastDay),
    current_ctc: ctc(m.ctc),
    expected_ctc: ctc(m.ctc),
    preferred_industry: z.string().min(1, m.industry),
    preferred_locations: z.array(z.string()).min(1, m.locations),
    resignation_letter: file(DOCUMENT, m.file),
    experience_letter: file(DOCUMENT, m.file),
    notice_period_proof_type: z
      .string()
      .refine((v) => oneOf(PROOF_TYPES, v), m.proofType),
    notice_period_proof: file(DOCUMENT, m.file),
    present_offer: file(DOCUMENT, m.file).nullish(),
  })
  return {
    schema: base.refine(payOk, {
      path: ["expected_ctc"],
      message: m.expectedLow,
      // check pay even while other fields, like the letters, are still missing
      when: ({ issues }) =>
        !issues.some((issue) => String(issue.path?.[0]).endsWith("_ctc")),
    }),
    /** Whether one step's fields all pass. */
    isDone: (id: keyof typeof STEPS, values: z.input<typeof base>) => {
      const mask: Partial<Record<keyof typeof base.shape, true>> = {}
      for (const key of STEPS[id]) mask[key] = true
      return (
        base.pick(mask).safeParse(values).success &&
        (id !== "work" || payOk(values))
      )
    },
  }
}

export type Values = z.infer<ReturnType<typeof makeSchema>["schema"]>
export type TextField = Exclude<keyof Values, (typeof FILE_FIELDS)[number]>

export const joinAddress = (values: Partial<Values>) =>
  join({
    line: values.address_line,
    city: values.address_city,
    state: values.address_state,
    pin: values.address_pin,
  })
