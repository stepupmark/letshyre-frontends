import { axe, expect, test, watch } from "./fixtures"

test("a signed-out visitor sees pricing with no app chrome and signs in to buy", async ({
  page,
}) => {
  const problems = watch(page)
  await page.goto("/employer/pricing")

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pay only for the candidates you unlock."
  )
  await expect(page).toHaveTitle(/^Pricing · /)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /10 free credits/
  )
  await expect(page.getByRole("navigation")).toHaveCount(0)
  await expect(page.getByRole("contentinfo")).toHaveCount(0)
  await expect(
    page.getByText("Every credit costs ₹49, whichever plan you choose.")
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Buy 25 credits for ₹1,225" })
  ).toHaveAttribute("href", "/employer/billing?checkout=25-credits")
  await axe(page)

  await page.getByRole("link", { name: "Buy Pro" }).click()
  await expect(page).toHaveURL(/\/sign-in\?/)
  expect(new URL(page.url()).searchParams.get("next")).toBe(
    "/employer/billing?checkout=pro"
  )
  expect(problems).toEqual([])
})

test("a signed-in employer goes from a plan straight to its checkout", async ({
  page,
  signInAs,
}) => {
  await signInAs("employer")
  await page.goto("/employer/pricing")

  await page.getByRole("link", { name: "Buy Business" }).click()
  await expect(page).toHaveURL("/employer/billing?checkout=business")
  await expect(page.getByRole("dialog")).toBeVisible()
})
