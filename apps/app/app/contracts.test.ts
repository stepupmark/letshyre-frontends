import { readFileSync } from "node:fs"

import { expect, test } from "vitest"
import type { z } from "zod"

import {
  interviewsSchema,
  unlockedPageSchema,
} from "@/features/candidate-unlock/api"
import { invoicesPageSchema, quoteSchema } from "@/features/billing/api"
import { profileSchema } from "@/features/candidate/api"
import { scorecardSchema } from "@/features/candidate/scorecard-schema"
import { cardsSchema, teamSchema } from "@/features/employer-dashboard/queries"
import { jobSchema, jobsPageSchema } from "@/features/employer-jobs/api"
import { matchesSchema } from "@/features/job-matches/api"
import { creditsSchema } from "@/lib/credits"
import { industriesSchema } from "@/lib/industries"
import { dataOf } from "@/lib/response"

// every schema the app parses responses with, against its fixture in e2e/api
const CONTRACTS: Record<string, z.ZodType> = {
  "payment.v1.employer_credits": creditsSchema,
  "payment.v1.employer.calculate-token-cost": quoteSchema,
  "payment.v1.credit_purchase_history": invoicesPageSchema,
  "user.v1.public.shared-candidate": scorecardSchema,
  "user.v1.employer_dashboard_cards": cardsSchema,
  "user.v1.employer_team_members": teamSchema,
  "user.v1.industries.list": industriesSchema,
  "user.v1.employer_jobs": jobsPageSchema,
  "user.v1.employer_job_detail.101": jobSchema,
  "user.v1.employer_job_ai.matching.101": matchesSchema,
  "user.v1.employer_candidate_interviews.5": interviewsSchema,
  "user.v1.employer_unlock_candidate": unlockedPageSchema,
  "user.v1.employer_unlock_candidate.31": profileSchema,
  "user.v1.employer_unlock_candidate.31.scorecard": scorecardSchema,
  "user.v1.candidate_scorecard.9": scorecardSchema,
}

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(new URL(`../e2e/api/${name}.json`, import.meta.url), "utf8")
  )

test.each(Object.entries(CONTRACTS))(
  "%s matches what the app expects",
  (name, schema) => {
    expect(() => schema.parse(dataOf(fixture(name)))).not.toThrow()
  }
)
