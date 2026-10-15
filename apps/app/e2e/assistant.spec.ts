import AxeBuilder from "@axe-core/playwright"

import { expect, reply, test } from "./fixtures"

test("a candidate asks the assistant from a page and follows its link into the app", async ({
  page,
  api,
  signInAs,
}) => {
  const sent: unknown[] = []
  await api({
    "POST /commonapp/v1/chatbot/chat/": async (route) => {
      sent.push(route.request().postDataJSON())
      await reply(route, {
        success: true,
        data: {
          session_id: "chat-1",
          response:
            "Applications move through **Applied**, then Shortlisted. See [your applications](/employee/applications).",
        },
      })
    },
  })
  await signInAs("candidate")
  await page.goto("/employee/profile")

  await page.getByRole("button", { name: "Ask the assistant" }).click()
  const sheet = page.getByRole("dialog", { name: "Assistant" })
  await expect(
    sheet.getByRole("button", { name: "Who can see my documents?" })
  ).toBeVisible()
  await expect(
    sheet.getByRole("textbox", { name: "Ask a question" })
  ).toBeFocused()

  await sheet
    .getByRole("textbox", { name: "Ask a question" })
    .fill("What happens after I apply?")
  await sheet.getByRole("textbox", { name: "Ask a question" }).press("Enter")
  await expect(sheet.getByText("Applied", { exact: true })).toBeVisible()
  expect(sent).toEqual([{ message: "What happens after I apply?" }])
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await sheet.getByRole("link", { name: "Open as a full page" }).click()
  await expect(page).toHaveURL("/employee/assistant")
  await expect(sheet).toBeHidden()
  await expect(
    page.getByRole("button", { name: "Ask the assistant" })
  ).toHaveCount(0)
  const log = page.getByRole("log", { name: "Conversation" })
  await expect(log.getByText("What happens after I apply?")).toBeVisible()

  await page
    .getByRole("textbox", { name: "Ask a question" })
    .fill("How do employers decide who to shortlist?")
  await page.getByRole("button", { name: "Send" }).click()
  await expect.poll(() => sent.length).toBe(2)
  expect(sent[1]).toEqual({
    message: "How do employers decide who to shortlist?",
    session_id: "chat-1",
  })

  await log
    .getByRole("button", { name: "How do I find jobs that fit me?" })
    .click()
  await expect.poll(() => sent.length).toBe(3)

  await log.getByRole("link", { name: "your applications" }).first().click()
  await expect(page).toHaveURL("/employee/applications")
})
