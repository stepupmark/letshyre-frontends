import { expect, reply, test } from "./fixtures"

test("an expired session that can't be refreshed goes back to sign-in", async ({
  page,
  api,
  signIn,
}) => {
  let refreshed = 0
  await api({
    "GET /user/v1/admin/profile/": (route) =>
      reply(route, { detail: "Token expired" }, 401),
    "POST /user/v1/login_refresh/": async (route) => {
      refreshed++
      await reply(route, { detail: "Token is invalid" }, 401)
    },
  })
  await signIn()

  await page.goto("/dashboard/credits")

  await expect(page).toHaveURL("/sign-in?reason=expired")
  await expect(page.getByRole("alert")).toContainText("Your session expired")
  expect(refreshed).toBe(1)
  expect(
    await page.evaluate(() => [
      localStorage.getItem("accessToken"),
      localStorage.getItem("refreshToken"),
    ])
  ).toEqual([null, null])
})
