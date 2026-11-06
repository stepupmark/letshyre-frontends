import { fillFields } from "./merge-fields"

const shell = (body: string) =>
  `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px 16px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:22px 20px;color:#111827;font-size:14px;line-height:1.65;">${body}</div></body></html>`

/**
 * The email as a candidate would get it. The server renders its own sample person, so its frame is
 * reused with our body swapped in, filled for the person being previewed.
 */
export function previewDocument({
  body,
  values,
  frame,
  mark = false,
}: {
  body: string
  values: Record<string, string>
  frame?: { html: string; body: string }
  mark?: boolean
}) {
  const filled = fillFields(body, values, { mark })
  if (frame?.body && frame.html.includes(frame.body))
    return frame.html.replace(frame.body, () => filled)
  return shell(filled)
}
