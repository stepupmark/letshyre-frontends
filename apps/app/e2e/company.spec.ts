import { readFileSync } from "node:fs"

import { axe, expect, reply, test } from "./fixtures"

test("an employer adds, holds with undo, and removes a team member", async ({
  page,
  api,
  signInAs,
}) => {
  const sent: unknown[] = []
  let removed = false
  await api({
    "POST /user/v1/employer_team_members/": async (route) => {
      sent.push(route.request().postDataJSON())
      await reply(route, { success: true })
    },
    "PATCH /user/v1/employer_team_members/11/": async (route) => {
      sent.push(route.request().postDataJSON())
      await reply(route, { success: true })
    },
    "DELETE /user/v1/employer_team_members/12/": async (route) => {
      removed = true
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/team")
  await expect(page.getByText("Meera Iyer")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: /^2 members\s*1 on hold$/ })
  ).toBeVisible()
  await axe(page)

  await page.getByRole("button", { name: "Add member" }).click()
  const dialog = page.getByRole("dialog", { name: "Add a team member" })
  await dialog.getByLabel("Full name").fill("Sana Khan")
  await dialog.getByLabel("Work email").fill("sana@acme.test")
  await dialog.getByLabel("Password", { exact: true }).fill("short")
  await dialog.getByRole("button", { name: "Add member" }).click()
  await expect(dialog.getByText("Use 8 to 50 characters.")).toBeVisible()
  expect(sent).toEqual([])
  await expect(
    dialog.getByRole("button", { name: "Copy password" })
  ).toHaveCount(0)
  await dialog.getByRole("button", { name: "Generate" }).click()
  await expect(
    dialog.getByRole("button", { name: "Copy password" })
  ).toBeVisible()
  await dialog.getByLabel("Password", { exact: true }).fill("e2e-pass-123")
  await dialog.getByRole("button", { name: "Add member" }).click()
  await expect(page.getByText("Sana Khan added")).toBeVisible()
  expect(sent[0]).toEqual({
    full_name: "Sana Khan",
    email: "sana@acme.test",
    password: "e2e-pass-123",
    title: "Recruiter",
  })

  await page.getByRole("button", { name: "Actions for Meera Iyer" }).click()
  await page.getByRole("menuitem", { name: "Put on hold" }).click()
  await page.getByRole("button", { name: "Undo" }).click()
  await expect
    .poll(() => sent.slice(1))
    .toEqual([{ status: "Hold" }, { status: "Active" }])
  await expect(page.getByText("Meera Iyer is active")).toHaveCount(0)

  await page.getByRole("button", { name: "Actions for Rahul Verma" }).click()
  await page.getByRole("menuitem", { name: "Remove" }).click()
  expect(removed).toBe(false)
  await page
    .getByRole("dialog", { name: "Remove Rahul Verma?" })
    .getByRole("button", { name: "Remove" })
    .click()
  await expect(page.getByText("Rahul Verma removed")).toBeVisible()
  expect(removed).toBe(true)
})

test("a revoked shared link can be turned back on with Undo", async ({
  page,
  api,
  signInAs,
}) => {
  const links = JSON.parse(
    readFileSync(
      new URL("api/user.v1.employer_shared_links.json", import.meta.url),
      "utf8"
    )
  ) as { data: { is_active: boolean }[] }
  const sent: { is_active: boolean }[] = []
  await api({
    "GET /user/v1/employer_shared_links/": (route) => reply(route, links),
    "PATCH /user/v1/employer_shared_links/71/": async (route) => {
      const body = route.request().postDataJSON() as { is_active: boolean }
      sent.push(body)
      if (links.data[0]) links.data[0].is_active = body.is_active
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/shared-links")

  await page
    .getByRole("button", { name: "Actions for Priya Nair's link" })
    .filter({ visible: true })
    .click()
  await page.getByRole("menuitem", { name: "Revoke" }).click()
  await expect(
    page.getByText("Revoked", { exact: true }).filter({ visible: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Undo" }).click()
  await expect
    .poll(() => sent)
    .toEqual([{ is_active: false }, { is_active: true }])
})
