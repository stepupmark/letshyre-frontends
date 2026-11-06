import { expect, test } from "vitest"

import { previewDocument } from "./preview-html"

const serverSample = {
  body: "<p>Hi Alex Morgan,</p>",
  html: '<html><body><div class="card"><p>Hi Alex Morgan,</p></div></body></html>',
}

const values = {
  candidate_name: "Jane Doe",
  job_role: "Backend Engineer",
  invite_link: "https://letshyre.test/join",
}

test("the server's frame shows the candidate being reviewed, not its sample person", () => {
  const html = previewDocument({
    body: "<p>Hi {{candidate_name}},</p>",
    values,
    frame: serverSample,
  })
  expect(html).toContain('<div class="card"><p>Hi Jane Doe,</p></div>')
  expect(html).not.toContain("Alex Morgan")
})

test("highlighting escapes names and leaves links inside tags intact", () => {
  const html = previewDocument({
    body: '<p>Hi {{candidate_name}}</p><a href="{{invite_link}}">{{invite_link}}</a>',
    values: { ...values, candidate_name: "<b>Jo</b>" },
    mark: true,
  })
  expect(html).toContain("&lt;b&gt;Jo&lt;/b&gt;</mark>")
  expect(html).toContain('href="https://letshyre.test/join"')
  expect(html).not.toContain('href="<mark')
})
