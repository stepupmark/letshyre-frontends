import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"

import { expect, reply, test, USERS } from "./fixtures"

const signedIn = (user: Record<string, unknown>) => ({
  success: true,
  data: { access_token: "new-access", refresh_token: "new-refresh", ...user },
})

const enterCode = async (page: Page) => {
  await page.getByLabel("6-digit code").fill("123456")
}

test("an employer page asks employers to sign in and returns to it", async ({
  page,
  api,
}) => {
  await api({
    "POST /user/v1/login/": async (route) => {
      const { password } = route.request().postDataJSON() as {
        password: string
      }
      await (password === "right-password"
        ? reply(route, signedIn(USERS.employer))
        : reply(route, { success: false, message: "Invalid credentials" }, 400))
    },
  })

  await page.goto("/employer/dashboard")
  await expect(page).toHaveURL(
    `/employer/sign-in?next=${encodeURIComponent("/employer/dashboard")}`
  )
  await expect(
    page.getByRole("heading", { name: "Welcome back, hiring team" })
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByLabel("Work email").fill("employer@test.in")
  await page.getByLabel("Password", { exact: true }).fill("wrong")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByRole("alert")).toContainText(
    "That email and password don't match"
  )
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused()

  await page.getByLabel("Password", { exact: true }).fill("right-password")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL("/employer/dashboard")
})

test("a job seeker on the employer page is turned away and sent to their own", async ({
  page,
  api,
}) => {
  await api({
    "POST /user/v1/login/": (route) => reply(route, signedIn(USERS.candidate)),
  })

  await page.goto("/employer/sign-in")
  await page.getByLabel("Work email").fill("candidate@test.in")
  await page.getByLabel("Password", { exact: true }).fill("password")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page.getByRole("alert")).toContainText(
    "This is a job seeker account"
  )
  expect(
    await page.evaluate(() => localStorage.getItem("accessToken"))
  ).toBeNull()

  await page.getByRole("link", { name: "Go to job seeker sign in" }).click()
  await expect(page).toHaveURL("/employee/sign-in")
  await expect(page.getByLabel("Email")).toHaveValue("candidate@test.in")
})

test("an employer registers, verifies email and mobile, and lands on onboarding", async ({
  page,
  api,
}) => {
  let registered: Record<string, unknown> = {}
  await api({
    "POST /commonapp/v1/send_otp/": (route) =>
      reply(route, { success: true, data: { otp_session_key: "email-key" } }),
    "POST /commonapp/v1/verify_otp/": (route) =>
      reply(route, { success: true }),
    "POST /commonapp/v1/mobile_send_otp/": (route) =>
      reply(route, { success: true, data: { otp_session_key: "mobile-key" } }),
    "POST /commonapp/v1/mobile_verify_otp/": (route) =>
      reply(route, { success: true }),
    "POST /user/v1/user_register/": async (route) => {
      registered = route.request().postDataJSON() as Record<string, unknown>
      await reply(route, { success: true })
    },
    "POST /user/v1/login/": (route) =>
      reply(route, signedIn(USERS.employerNew)),
  })

  await page.goto("/get-started")
  await page.getByRole("link", { name: /I'm hiring/ }).click()
  await expect(page).toHaveURL("/employer/register")

  await page.getByLabel("Full name").fill("Priya Shah")
  await page.getByLabel("Work email").fill("priya@acme.in")
  await page.getByRole("button", { name: "Continue" }).click()

  await expect(page.getByText("We sent it to p••••@acme.in.")).toBeVisible()
  await enterCode(page)

  await expect(
    page.getByRole("heading", { name: "Add your mobile number" })
  ).toBeVisible()
  // a refresh keeps the place and what was entered
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Add your mobile number" })
  ).toBeVisible()
  await page.getByLabel("Mobile number").fill("+91 98765 43210")
  await page.getByRole("button", { name: "Send code" }).click()
  await enterCode(page)

  await page.getByLabel("Password", { exact: true }).fill("a-long-password")
  await page.getByLabel("Confirm password").fill("a-long-password")
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(
    page.getByText("Agree to the terms to create your account")
  ).toBeVisible()
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Create account" }).click()

  await expect(page).toHaveURL("/employer/onboarding")
  expect(registered).toMatchObject({
    role: "Employer",
    name: "Priya Shah",
    email: "priya@acme.in",
    emailOtpSessionKey: "email-key",
    phone_number: "9876543210",
    mobileOtpSessionKey: "mobile-key",
    agreed_to_terms: true,
  })
  const stored = await page.evaluate(() => JSON.stringify(sessionStorage))
  expect(stored).not.toContain("a-long-password")
})

test("a forgotten password is reset with an email code", async ({
  page,
  api,
}) => {
  let reset: Record<string, unknown> = {}
  await api({
    "POST /commonapp/v1/send_otp/": (route) =>
      reply(route, { success: true, data: { otp_session_key: "reset-key" } }),
    "POST /commonapp/v1/verify_otp/": (route) =>
      reply(route, { success: true }),
    "POST /user/v1/forgot_password/": async (route) => {
      reset = route.request().postDataJSON() as Record<string, unknown>
      await reply(route, { success: true })
    },
  })

  await page.goto("/employee/sign-in")
  await page.getByRole("link", { name: "Forgot password?" }).click()
  await page.getByLabel("Email").fill("asha@test.in")
  await page.getByRole("button", { name: "Send code" }).click()
  await enterCode(page)
  await page.getByLabel("New password").fill("new-password-1")
  await page.getByLabel("Confirm password").fill("new-password-1")
  await page.getByRole("button", { name: "Save password" }).click()

  await expect(page).toHaveURL("/employee/sign-in")
  await expect(page.getByText("Your password is changed.")).toBeVisible()
  await expect(page.getByLabel("Email")).toHaveValue("asha@test.in")
  expect(reset).toMatchObject({
    email: "asha@test.in",
    otp_session_key: "reset-key",
    new_password: "new-password-1",
  })
})

test("when the session ends, signing in again keeps the open page", async ({
  page,
  api,
  signInAs,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "session handling is browser-independent"
  )
  let expired = true
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      expired
        ? reply(route, { detail: "token expired" }, 401)
        : reply(route, { success: true, data: { available_credits: 12 } }),
    "POST /user/v1/login_refresh/": (route) =>
      reply(route, { detail: "refresh expired" }, 401),
    "POST /user/v1/login/": async (route) => {
      expired = false
      await reply(route, signedIn(USERS.employer))
    },
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  const dialog = page.getByRole("dialog", { name: "Sign in to continue" })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel("Email")).toHaveValue("employer@test.in")
  await dialog.getByLabel("Password", { exact: true }).fill("password")
  await dialog.getByRole("button", { name: "Sign in" }).click()

  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL("/employer/dashboard")
  await expect(page.getByRole("link", { name: "12 credits" })).toBeVisible()
})
