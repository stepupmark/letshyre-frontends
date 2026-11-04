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

// templates are few, so one large page saves paging through the library
export const listTemplates = async () =>
  parseTemplates(await api.get(BASE, { query: { page_size: 100 } }))

export const copyTemplate = async (sourceId: string, name: string) =>
  parseTemplate(await api.post(BASE, { source_template_id: sourceId, name }))

export const updateTemplate = async (id: string, changes: TemplateChanges) =>
  parseTemplate(await api.patch(`${BASE}${id}/`, changes))

export const deleteTemplate = async (id: string) =>
  acknowledge(await api.delete(`${BASE}${id}/`))

// the server renders its own sample candidate; the app fills in real names over that frame
export const previewTemplate = async (id: string) =>
  parsePreview(await api.get(`${BASE}${id}/`))

export const sendInvitations = async (
  id: string,
  body: { recipients: Recipient[]; job_role: string }
) => parseSent(await api.post(`${BASE}${id}/send/`, body))
