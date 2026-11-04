import { acknowledge, HttpError } from "@workspace/api"

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

// browsers drop a GET body, so the values go in the query; a server that only reads a body gets a POST
export async function previewTemplate(id: string, context: PreviewContext) {
  const path = `${BASE}${id}/preview/`
  try {
    return parsePreview(await api.get(path, { query: { ...context } }))
  } catch (error) {
    if (!(error instanceof HttpError) || error.status >= 500) throw error
    return parsePreview(await api.post(path, context))
  }
}

export const sendInvitations = async (
  id: string,
  body: { recipients: Recipient[]; job_role: string }
) => parseSent(await api.post(`${BASE}${id}/send/`, body))
