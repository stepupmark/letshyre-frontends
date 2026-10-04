import type { Plan } from "@workspace/api/public"
import { describe, expect, it } from "vitest"

import { checkoutItem, safeNext, toPaise } from "./checkout"

const plan = (slug: string, planType: string): Plan => ({
  id: `id-${slug}`,
  slug,
  name: slug,
  credits: 50,
  basePrice: 2500,
  rate: 50,
  planType,
  tagline: null,
  highlight: false,
  sortOrder: 0,
})
const plans = [plan("free", "free"), plan("pro", "paid_one_time")]

describe("what ?checkout= can sell", () => {
  it("sells a paid plan by its slug, with the API's id and credits", () => {
    expect(checkoutItem("pro", plans)).toMatchObject({
      kind: "plan",
      planId: "id-pro",
      credits: 50,
    })
  })

  it("sells only the listed top-up packs", () => {
    expect(checkoutItem("25-credits", [])).toMatchObject({
      kind: "topUp",
      credits: 25,
      planId: null,
    })
    expect(checkoutItem("7-credits", [])).toBeNull()
  })

  it("never sells the free plan or an unknown key", () => {
    expect(checkoutItem("free", plans)).toBeNull()
    expect(checkoutItem("enterprise", plans)).toBeNull()
  })
})

it("converts rupees to paise without float drift", () => {
  expect(toPaise(1179.99)).toBe(117999)
  expect(toPaise(2.35)).toBe(235)
})

it("returns only to a page in the employer app after paying", () => {
  expect(safeNext("/employer/candidate-pool?jobId=1&candidate=5")).toBe(
    "/employer/candidate-pool?jobId=1&candidate=5"
  )
  expect(safeNext("https://evil.example/employer")).toBeNull()
  expect(safeNext("//evil.example/employer")).toBeNull()
  expect(safeNext("/employerx")).toBeNull()
})
