import { z } from "zod"

import { joinAddress as join } from "@/lib/address"
import { PIN_CODE } from "@/lib/company-ids"
import {
  addMonths,
  parseIsoDate,
  startOfToday,
  toIsoDate,
  yearsBetween,
} from "@/lib/date"
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

/** 18 or older on `today`. */
export function isAdult(dob: string, today = startOfToday()) {
  const born = parseIsoDate(dob)
  return born !== null && yearsBetween(born, today) >= 18
}

/** Serving notice or already left, within a sensible window. */
export const lastDayRange = (today = startOfToday()) => ({
  min: addMonths(today, -60),
  max: addMonths(today, 6),
})

const inRange = (value: string, min: Date, max: Date) => {
  const date = parseIsoDate(value)
  return date !== null && date >= min && date <= max
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
    "desired_ctc",
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
  | "dateInvalid"
  | "dobFuture"
  | "dobOld"
  | "adult"
  | "aadhaar"
  | "address"
  | "city"
  | "state"
  | "pin"
  | "photo"
  | "company"
  | "lastDay"
  | "lastDayRange"
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

/** 12 → 16 is 0.33; 0 when there's no current pay to compare with. */
export const payRaise = (v: { current_ctc: string; expected_ctc: string }) =>
  Number(v.current_ctc) > 0
    ? Number(v.expected_ctc) / Number(v.current_ctc) - 1
    : 0

const payOk = (v: { current_ctc: string; expected_ctc: string }) =>
  Number(v.expected_ctc) >= Number(v.current_ctc)

export const makeSchema = (m: Messages) => {
  const file = (rules: FileRules, message: string) =>
    z
      // abort: false so a missing file doesn't skip the pay check
      .custom<File>((value) => value instanceof File, { message, abort: false })
      .refine(
        (value) => !(value instanceof File) || checkFile(value, rules) === null,
        m.fileInvalid
      )

  const base = z.object({
    gender: z.string().refine((v) => oneOf(GENDERS, v), m.gender),
    dob: z
      .string()
      .min(1, { message: m.dob, abort: true })
      .refine((v) => parseIsoDate(v) !== null, {
        message: m.dateInvalid,
        abort: true,
      })
      .refine((v) => v <= toIsoDate(startOfToday()), {
        message: m.dobFuture,
        abort: true,
      })
      .refine((v) => isAdult(v), { message: m.adult, abort: true })
      .refine(
        (v) => inRange(v, addMonths(startOfToday(), -1200), startOfToday()),
        m.dobOld
      ),
    aadhar_number: z.string().refine(isAadhaar, m.aadhaar),
    address_line: z.string().trim().min(5, m.address),
    address_city: z.string().trim().min(2, m.city),
    address_state: z.string().trim().min(2, m.state),
    address_pin: z.string().trim().regex(PIN_CODE, m.pin),
    profile_photo: file(PHOTO, m.photo),
    present_or_last_working_company: z.string().trim().min(2, m.company),
    last_day_of_working: z
      .string()
      .min(1, { message: m.lastDay, abort: true })
      .refine((v) => parseIsoDate(v) !== null, {
        message: m.dateInvalid,
        abort: true,
      })
      .refine((v) => {
        const { min, max } = lastDayRange()
        return inRange(v, min, max)
      }, m.lastDayRange),
    current_ctc: ctc(m.ctc),
    expected_ctc: ctc(m.ctc),
    desired_ctc: ctc(m.ctc),
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
      when: ({ issues }) =>
        !issues.some((issue) =>
          ["current_ctc", "expected_ctc"].includes(String(issue.path?.[0]))
        ),
    }),
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
