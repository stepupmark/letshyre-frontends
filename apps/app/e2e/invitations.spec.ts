import { expect, fixture, reply, test, watch } from "./fixtures"

const BASE = "/commonapp/v1/employer/email_templates"
const STANDARD = "cc17de0d-2303-411f-983f-0bf05239b7d1"
const COPY = "afbf32a0-3614-4e71-93fe-289111cd18eb"

const list = fixture("commonapp.v1.employer.email_templates.json") as {
  data: { results: Record<string, unknown>[] }
}
const standard = list.data.results.find((t) => t.id === STANDARD) ?? {}
const page = (results: Record<string, unknown>[]) => ({
  ...list,
  data: { ...list.data, count: results.length, results },
})

test("an employer copies a starter, rewords it and invites two candidates", async ({
  page: tab,
  api,
  signInAs,
}) => {
  const problems = watch(tab)
  let copy: Record<string, unknown> | null = null
  const sent: Record<string, unknown>[] = []
  await tab.route("https://letshyre.com/**", (route) =>
    route.fulfill({ status: 204 })
  )
  await api({
    [`GET ${BASE}/`]: (route) =>
      reply(
        route,
        page(copy ? [copy, ...list.data.results] : list.data.results)
      ),
    [`POST ${BASE}/`]: async (route) => {
      sent.push(route.request().postDataJSON() as Record<string, unknown>)
      copy = {
        ...standard,
        id: COPY,
        name: "Acme invite",
        is_system: false,
        scope: "employer",
      }
      await reply(route, { success: true, status: 201, data: copy }, 201)
    },
    [`GET ${BASE}/${COPY}/preview/`]: fixture(
      `commonapp.v1.employer.email_templates.${STANDARD}.preview.json`
    ),
    [`PATCH ${BASE}/${COPY}/`]: async (route) => {
      const changes = route.request().postDataJSON() as Record<string, unknown>
      sent.push(changes)
      copy = { ...copy, ...changes }
      await reply(route, { success: true, data: copy })
    },
    [`POST ${BASE}/${COPY}/send/`]: async (route) => {
      sent.push(route.request().postDataJSON() as Record<string, unknown>)
      await reply(route, {
        success: true,
        data: {
          template_id: COPY,
          queued_count: 1,
          recipients: ["jane@acme.test"],
        },
      })
    },
  })
  await signInAs("employer")
  await tab.goto("/employer/invitations")

  await tab
    .getByRole("article")
    .filter({ hasText: "Interview Invitation - Standard" })
    .getByRole("button", { name: "Make a copy" })
    .click()
  const dialog = tab.getByRole("dialog", { name: "Make a copy" })
  await expect(dialog.getByLabel("Template name")).toHaveValue(
    "Interview Invitation - Standard (copy)"
  )
  await dialog.getByLabel("Template name").fill("Acme invite")
  await dialog.getByRole("button", { name: "Make a copy" }).click()
  expect(sent.shift()).toEqual({
    source_template_id: STANDARD,
    name: "Acme invite",
  })

  await expect(tab).toHaveURL(`/employer/invitations/templates/${COPY}`)
  const message = tab.getByRole("textbox", { name: "Message" })
  await message.click()
  await tab.keyboard.press("Control+End")
  await tab.keyboard.type(" Ask {{sender")
  await tab.getByRole("option", { name: /Your name/ }).click()
  await expect(tab.getByTitle("Email preview")).toBeVisible()
  await tab.getByRole("button", { name: "Save changes" }).click()
  await expect(tab.getByText("Template saved")).toBeVisible()

  const saved = sent.shift() ?? {}
  expect(Object.keys(saved)).toEqual(["body_html_template"])
  const body = String(saved.body_html_template)
  // the copy must still be the starter, byte for byte, apart from the new words
  expect(body).toContain("Ask {{sender_name}}</p>")
  expect(body).toContain(
    '<a href="{{invite_link}}" style="display:inline-block;background-color:#2563eb;'
  )
  expect(body).toContain(
    '<p style="font-size:13px;color:#6b7280;"><strong>Important:</strong>'
  )
  expect(body).not.toMatch(/data-(style|merge)|rgb\(/)

  await tab.getByRole("link", { name: "Invitations" }).first().click()
  await tab
    .getByRole("article")
    .filter({ hasText: "Acme invite" })
    .getByRole("link", { name: "Use" })
    .click()
  await expect(tab.getByRole("radio", { name: /Acme invite/ })).toBeChecked()
  await tab.getByRole("button", { name: "Continue" }).click()

  await tab.getByRole("combobox", { name: "Job role" }).fill("Backend Engineer")
  await tab
    .getByLabel("Add candidates")
    .fill("Jane Doe <jane@acme.test>\njohn.smith@acme.test\nJANE@acme.test")
  await tab.getByRole("button", { name: "Add to list" }).click()
  await expect(tab.getByText("2 added · 1 already in the list")).toBeVisible()
  await expect(tab.getByLabel("Name for john.smith@acme.test")).toHaveValue(
    "John Smith"
  )
  await tab.getByRole("button", { name: "Continue" }).click()

  await expect(tab.getByText("Jane Doe · 1 of 2")).toBeVisible()
  await tab.getByRole("button", { name: "Send 2 invitations" }).click()
  expect(sent.shift()).toEqual({
    recipients: [
      { email: "jane@acme.test", name: "Jane Doe" },
      { email: "john.smith@acme.test", name: "John Smith" },
    ],
    job_role: "Backend Engineer",
  })
  await expect(
    tab.getByRole("heading", { name: "1 invitation on its way" })
  ).toBeVisible()
  await expect(tab.getByText("1 wasn't sent")).toBeVisible()
  await expect(tab.getByText("john.smith@acme.test")).toBeVisible()
  expect(problems).toEqual([])
})
