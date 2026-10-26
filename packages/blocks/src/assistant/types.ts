export interface AssistantLabels {
  log: string
  you: string
  assistant: string
  input: string
  send: string
  stop: string
  thinking: string
  slow: string
  stopped: string
  failed: string
  retry: string
  clear: string
  copy: string
  copied: string
  latest: string
}

export type Ask = (text: string) => void
