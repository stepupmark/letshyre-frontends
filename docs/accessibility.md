# Accessibility

Target: WCAG 2.2 AA in all three apps, in light and dark, LTR and RTL.

## What runs automatically

- Every Playwright test runs axe on the page it ends on (`checkAxe` in each app's `e2e/fixtures.ts`).
  Tests also call `axe(page)` at the states in between that matter, such as an open dialog. Opt out
  with `test.use({ axeAtEnd: false })` only when another test already checks that end state.
- Marketing checks the WCAG 2.0–2.2 A and AA tags. The app and admin run every axe rule, including
  best practices.
- After a client navigation, `useRouteFocus` (`@workspace/blocks/route-focus`) moves focus to the
  page's `h1`, or to `#main`. It leaves focus alone when the page already moved it, or when the URL
  has a hash.

## WCAG 2.2 criteria axe can't check

| Criterion                       | Status                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.4.11 Focus Not Obscured       | `scroll-padding-top` on `html` keeps focus clear of the sticky headers. The cookie banner can still cover the bottom of the page until it is dismissed. |
| 2.4.13 Focus Appearance (AAA)   | Not targeted. Controls use the 3px `ring-ring/50`.                                                                                                      |
| 2.5.7 Dragging Movements        | Nothing is drag-only. The file dropzones also open a file picker.                                                                                       |
| 2.5.8 Target Size (Minimum)     | axe checks it (`target-size`).                                                                                                                          |
| 3.2.6 Consistent Help           | Help is the same sidebar group on every app page. Marketing keeps contact in the footer.                                                                |
| 3.3.7 Redundant Entry           | Registration and candidate onboarding keep entries across steps and reloads. Check the other wizards during the manual pass.                            |
| 3.3.8 Accessible Authentication | Passwords and codes accept paste and autofill (`current-password`, `new-password`, `one-time-code`). No puzzles.                                        |

## Manual screen reader pass

Do this before a major release, and after changing a shell, form or dialog. Use NVDA with Firefox or
Chrome on Windows, and VoiceOver with Safari on macOS and iOS. Write down every result, including
the ones that pass.

For each app:

1. Load a page. The title and language are announced, and the skip link is the first Tab stop and
   works.
2. Move between pages using the sidebar or the header. The new page's heading is announced, and Tab
   continues from the content.
3. Browse by headings (`H` / VO+Cmd+H) and by landmarks (`D` / the rotor). There is one `h1`, the
   levels don't skip, and banner, navigation, main and contentinfo are present.
4. Open and close every dialog, sheet and menu on the journey. Focus moves in, stays inside, and goes
   back to the control that opened it. Escape closes it.
5. Submit each form empty, then with a bad value. Each error is announced and linked to its field,
   and focus goes to the first invalid field.
6. Toasts, loading states and the assistant's replies are announced through live regions, without
   moving focus.
7. Tables: header cells are announced with each cell, and row actions name their row.
8. Switch to Arabic or Urdu. The reading order and the direction of arrow keys follow RTL.
9. Zoom to 200% and use a 320 px wide viewport. Nothing is cut off, and nothing scrolls sideways
   except tables.

Journeys:

- **Marketing:** home, pricing, contact form, language menu, the assistant.
- **App:**
  - sign-in and registration with an OTP
  - employer onboarding
  - posting a job
  - unlocking a candidate
  - buying credits
  - candidate onboarding
  - applying for a job
- **Admin:** sign-in, a KYC review, changing the credit price.

Log the issues you find as bugs, with the screen reader, browser and steps.
