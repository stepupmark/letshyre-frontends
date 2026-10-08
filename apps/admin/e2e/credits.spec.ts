import { CREDIT, expect, reply, test } from "./fixtures"

test("changing the credit price needs confirming and sends the new price", async ({
  page,
  api,
  signIn,
}) => {
  let sent: unknown
  await api({
    "GET /finances/v1/credits_managment/": CREDIT,
    "PUT /finances/v1/credits_managment_detail/1/": async (route) => {
      sent = route.request().postDataJSON()
      await reply(route, {
        success: true,
        data: { id: "1", credit_value: "75.50", is_active: true },
      })
    },
  })
  await signIn()
  await page.goto("/dashboard/credits")

  const price = page.getByLabel("Price")
  await price.fill("75.555")
  await page.getByRole("button", { name: "Save price" }).click()
  await expect(page.getByText("Use up to 2 decimals")).toBeVisible()

  await price.fill("75.50")
  await page.getByRole("button", { name: "Save price" }).click()
  const confirm = page.getByRole("alertdialog")
  await expect(confirm).toContainText("₹75.50")
  expect(sent).toBeUndefined()
  await confirm.getByRole("button", { name: "Change price" }).click()

  await expect(confirm).toBeHidden()
  expect(sent).toEqual({ credit_value: "75.50" })
})
