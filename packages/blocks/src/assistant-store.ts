export interface AssistantMessage {
  id: string
  role: "user" | "assistant"
  text: string
  /** On a user message whose answer never came. */
  problem?: "failed" | "stopped"
}

export interface AssistantState {
  messages: AssistantMessage[]
  sessionId?: string
  pending: boolean
}

export type AssistantSend = (
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal
) => Promise<{ sessionId: string; response: string }>

const PREFIX = "assistant:v1:"
const IDLE_MS = 60 * 60 * 1000
const MAX_MESSAGES = 100
const EMPTY: AssistantState = { messages: [], pending: false }

interface Chat {
  state: AssistantState
  listeners: Set<() => void>
  controller?: AbortController
}

const chats = new Map<string, Chat>()

const uid = () => crypto.randomUUID()

// transcripts live for the tab, like the session; storage may be blocked
function read(key: string): AssistantState {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (!raw) return EMPTY
    const saved = JSON.parse(raw) as Partial<{
      messages: AssistantMessage[]
      sessionId: string
      at: number
    }>
    if (
      !Array.isArray(saved.messages) ||
      Date.now() - (saved.at ?? 0) > IDLE_MS
    )
      return EMPTY
    return {
      messages: saved.messages,
      sessionId: saved.sessionId,
      pending: false,
    }
  } catch {
    return EMPTY
  }
}

function write(key: string, state: AssistantState) {
  try {
    if (state.messages.length === 0) {
      sessionStorage.removeItem(PREFIX + key)
      return
    }
    sessionStorage.setItem(
      PREFIX + key,
      JSON.stringify({
        messages: state.messages.slice(-MAX_MESSAGES),
        sessionId: state.sessionId,
        at: Date.now(),
      })
    )
  } catch {
    /* full or blocked: the chat still works for this page */
  }
}

function chatFor(key: string) {
  let chat = chats.get(key)
  if (!chat) {
    chat = { state: read(key), listeners: new Set() }
    chats.set(key, chat)
  }
  return chat
}

function update(key: string, change: Partial<AssistantState>) {
  const chat = chatFor(key)
  chat.state = { ...chat.state, ...change }
  write(key, chat.state)
  for (const listener of chat.listeners) listener()
}

export function subscribe(key: string, listener: () => void) {
  const chat = chatFor(key)
  chat.listeners.add(listener)
  return () => {
    chat.listeners.delete(listener)
  }
}

export const snapshot = (key: string) => chatFor(key).state

/** Sends `text`, or re-sends the user message `retryId` in place. */
export async function ask(
  key: string,
  send: AssistantSend,
  text: string,
  retryId?: string
) {
  const chat = chatFor(key)
  if (chat.state.pending) return
  const id = retryId ?? uid()
  const messages = retryId
    ? chat.state.messages.map((m) =>
        m.id === id ? { ...m, problem: undefined } : m
      )
    : [...chat.state.messages, { id, role: "user" as const, text }]
  const controller = new AbortController()
  chat.controller = controller
  update(key, { messages, pending: true })

  try {
    const reply = await send(text, chat.state.sessionId, controller.signal)
    if (controller.signal.aborted) return
    update(key, {
      messages: [
        ...chatFor(key).state.messages,
        { id: uid(), role: "assistant", text: reply.response },
      ],
      sessionId: reply.sessionId,
      pending: false,
    })
  } catch {
    // a stop or a clear already settled the state
    if (controller.signal.aborted) return
    markUser(key, id, "failed")
  } finally {
    if (chat.controller === controller) chat.controller = undefined
  }
}

function markUser(
  key: string,
  id: string,
  problem: AssistantMessage["problem"]
) {
  update(key, {
    messages: chatFor(key).state.messages.map((m) =>
      m.id === id ? { ...m, problem } : m
    ),
    pending: false,
  })
}

export function stop(key: string) {
  const chat = chatFor(key)
  if (!chat.state.pending) return
  chat.controller?.abort()
  const last = chat.state.messages.findLast((m) => m.role === "user")
  if (last) markUser(key, last.id, "stopped")
}

/** Forgets the conversation, including the server's session for it. */
export function clear(key: string) {
  chatFor(key).controller?.abort()
  update(key, { messages: [], sessionId: undefined, pending: false })
}

/** On sign-out, so the next person on this tab starts clean. */
export function clearAll() {
  for (const key of chats.keys()) clear(key)
  try {
    for (const name of Object.keys(sessionStorage))
      if (name.startsWith(PREFIX)) sessionStorage.removeItem(name)
  } catch {
    /* empty */
  }
}
