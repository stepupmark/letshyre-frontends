import { expect, test } from "./fixtures"

test("a candidate walks through the interview guide step by step", async ({
  page,
  signInAs,
}) => {
  await signInAs("candidate")
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/employee/interview-guide")

  const current = page.locator('li[aria-current="step"]')
  await expect(current).toContainText("Install the desktop app")

  await page
    .getByRole("button", { name: "Allow camera, microphone and screen" })
    .click()
  await expect(current).toContainText("Allow camera, microphone and screen")
  await expect(
    page.getByText("Microphone", { exact: true }).filter({ visible: true })
  ).toBeVisible()

  await page.keyboard.press("ArrowUp")
  await expect(current).toContainText("Close other apps")
  await expect(
    page.getByRole("button", { name: "Close other apps" })
  ).toBeFocused()
})
