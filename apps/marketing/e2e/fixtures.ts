import AxeBuilder from "@axe-core/playwright"
import { test as base, expect, type Page } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]

export const axe = async (page: Page, scope = "body") => {
  // scroll-driven reveals stop part-faded wherever the viewport leaves them; with
  // reduced motion they rest at their final state, which is what axe should judge
  await page.emulateMedia({ reducedMotion: "reduce" })
  // a step mid-fade reads as low contrast
  await page
    .waitForFunction(
      () =>
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState !== "running" ||
              a.effect?.getTiming().iterations === Infinity
          ),
      undefined,
      { timeout: 2000 }
    )
    .catch(() => undefined)
  // a transition that starts after that check still settles within this window
  await expect
    .poll(
      async () =>
        (
          await new AxeBuilder({ page })
            .include(scope)
            .withTags(WCAG)
            // Base UI's focus guards are hidden tab sentinels, not content
            .exclude("[data-base-ui-focus-guard]")
            .analyze()
        ).violations,
      { timeout: 20_000 }
    )
    .toEqual([])
}

export const test = base.extend<{
  /** set false where the last state is checked on purpose elsewhere */
  axeAtEnd: boolean
  checkAxe: undefined
}>({
  axeAtEnd: [true, { option: true }],
  // every passing test also leaves the page it ends on clean under axe
  checkAxe: [
    async ({ page, axeAtEnd }, use, info) => {
      await use(undefined)
      if (!axeAtEnd || info.status !== info.expectedStatus) return
      if (!page.url().startsWith("http") || page.isClosed()) return
      await axe(page)
    },
    { auto: true },
  ],
})

export { expect }
