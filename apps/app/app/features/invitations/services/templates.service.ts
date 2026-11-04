import { acknowledge } from "@workspace/api"

import { api } from "@/lib/api"

import type { Recipient } from "../lib/recipients"
import {
  parsePreview,
  parseSent,
  parseTemplate,
  parseTemplates,
} from "../schemas/template.schema"

const BASE = "commonapp/v1/employer/email_templates/"

export interface TemplateChanges {
  name?: string
  subject_template?: string
  body_html_template?: string
}

export interface PreviewContext {
  candidate_name: string
  job_role: string
}

// templates are few, so one large page saves paging through the library
export const listTemplates = async () =>
  parseTemplates(await api.get(BASE, { query: { page_size: 100 } }))

export const copyTemplate = async (sourceId: string, name: string) =>
  parseTemplate(await api.post(BASE, { source_template_id: sourceId, name }))

export const updateTemplate = async (id: string, changes: TemplateChanges) =>
  parseTemplate(await api.patch(`${BASE}${id}/`, changes))

export const deleteTemplate = async (id: string) =>
  acknowledge(await api.delete(`${BASE}${id}/`))

// the preview is a POST to the template itself, with the sample values as the body
export const previewTemplate = async (id: string, context: PreviewContext) =>
  parsePreview(await api.post(`${BASE}${id}/`, context))

export const sendInvitations = async (
  id: string,
  body: { recipients: Recipient[]; job_role: string }
) => parseSent(await api.post(`${BASE}${id}/send/`, body))
