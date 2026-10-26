import { readFileSync } from "node:fs"
import AxeBuilder from "@axe-core/playwright"

import { expect, test, watch } from "./fixtures"

const ID = "a1b2c3d4e5f6"
const ENDPOINT = `GET /user/v1/public/shared-candidate/${ID}`
const report = JSON.parse(
  readFileSync(
    new URL("api/user.v1.public.shared-candidate.json", import.meta.url),
    "utf8"
  )
) as Record<string, unknown>

test("a shared scorecard opens without a session and a refresh doesn't spend another view", async ({
  page,
  api,
}) => {
  const problems = watch(page)
  let views = 0
  await api({
    [ENDPOINT]: async (route) => {
      views++
      await route.fulfill({
        json: report,
        headers: { "access-control-allow-origin": "*" },
      })
    },
  })

  await page.goto(`/shared-scorecard/${ID}`)

  await expect(
    page.getByRole("heading", { level: 1, name: "Asha Rao" })
  ).toBeVisible()
  await expect(page.getByText("Shared privately by Acme Labs")).toBeVisible()
  await expect(page.getByText("Strong interview")).toBeVisible()
  // the unanswered trailing question is left out
  await expect(page.getByText("Based on 4 answered questions")).toBeVisible()
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0)
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
    "content",
    "no-referrer"
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.reload()
  await expect(
    page.getByRole("heading", { level: 1, name: "Asha Rao" })
  ).toBeVisible()
  expect(views).toBe(1)
  expect(problems).toEqual([])
})

test("an expired link says so and what to do", async ({ page, api }) => {
  await api({
    [ENDPOINT]: async (route) => {
      await route.fulfill({
        status: 404,
        json: { success: false, message: "This share link has expired." },
        headers: { "access-control-allow-origin": "*" },
      })
    },
  })

  await page.goto(`/shared-scorecard/${ID}`)

  await expect(
    page.getByRole("heading", { name: "This link has expired" })
  ).toBeVisible()
})
