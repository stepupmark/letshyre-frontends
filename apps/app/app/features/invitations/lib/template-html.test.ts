// @vitest-environment jsdom
import { Editor } from "@tiptap/react"
import { afterEach, describe, expect, test } from "vitest"

import fixture from "../../../../e2e/api/commonapp.v1.employer.email_templates.json"
import { bodyExtensions } from "./editor/extensions"
import { fromEditorHtml, sameHtml, toEditorHtml } from "./template-html"

const editors: Editor[] = []
afterEach(() => {
  editors.splice(0).forEach((editor) => {
    editor.destroy()
  })
})

function roundTrip(stored: string) {
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: bodyExtensions({
      labelOf: () => "label",
      placeholder: "",
      onEditButton: () => undefined,
      editLabel: "",
    }),
    content: toEditorHtml(stored),
  })
  editors.push(editor)
  return fromEditorHtml(editor.getHTML())
}

describe("template HTML through the editor", () => {
  test.each(fixture.data.results.map((t) => [t.name, t.body_html_template]))(
    "%s comes back unchanged",
    (_, html) => {
      expect(sameHtml(roundTrip(html), html)).toBe(true)
    }
  )

  test("the invite link stays a link target and fields keep their keys", () => {
    const html = roundTrip(
      '<p>Hi {{ candidate_name }}, <a href="{{invite_link}}">start</a></p>'
    )
    expect(html).toBe(
      '<p>Hi {{candidate_name}}, <a href="{{invite_link}}">start</a></p>'
    )
  })

  test("scripts, handlers and unsafe CSS don't survive", () => {
    const html = roundTrip(
      '<p style="color:#111;background:url(https://x.test/a.png)" onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
    )
    expect(html).toBe('<p style="color:#111;">Hi</p><p>bad</p>')
    expect(
      roundTrip(
        '<div data-lh-button data-href="javascript:alert(1)" data-label="Go"></div>'
      )
    ).toContain('href="{{invite_link}}"')
  })

  test("formatting the editor can't hold is reported, not silently kept", () => {
    const stored = "<table><tr><td>Hi</td></tr></table>"
    expect(sameHtml(roundTrip(stored), stored)).toBe(false)
  })
})
