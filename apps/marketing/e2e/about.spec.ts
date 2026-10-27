import { expect, test } from "./fixtures.ts"

test("closing call to action hands employers and candidates to sign-up", async ({
  page,
}) => {
  await page.goto("/en/about")
  const cta = page.getByRole("region", { name: "Ready to hire or get hired?" })
  await expect(cta.getByRole("link", { name: "Start hiring" })).toHaveAttribute(
    "href",
    /\/employer\/register$/
  )
  await expect(
    cta.getByRole("link", { name: "Create your profile" })
  ).toHaveAttribute("href", /\/employee\/register$/)
})
