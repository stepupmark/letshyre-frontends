import { useEffect, useState, useSyncExternalStore } from "react"
import { useSearchParams } from "react-router"

const PREFIX = "flow:v1:"
const EMPTY = {}

const listeners = new Set<() => void>()
const snapshots = new Map<string, { raw: string | null; data: object }>()

function readRaw(name: string) {
  try {
    return sessionStorage.getItem(PREFIX + name)
  } catch {
    return null
  }
}

function snapshot(name: string): object {
  const raw = readRaw(name)
  const cached = snapshots.get(name)
  if (cached?.raw === raw) return cached.data
  // forgotten answers stay on screen until the flow unmounts
  if (cached && raw === null) return cached.data

  let data: object = EMPTY
  try {
    if (raw) data = JSON.parse(raw) as object
  } catch {
    /* corrupt answers start the flow over */
  }
  snapshots.set(name, { raw, data })
  return data
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function save(name: string, data: object) {
  let raw: string | null = JSON.stringify(data)
  try {
    sessionStorage.setItem(PREFIX + name, raw)
  } catch {
    raw = null
  }
  snapshots.set(name, { raw, data })
  for (const listener of listeners) listener()
}

/** A flow's saved answers, for anything that wants to follow along, like the side panel. */
export const useFlowData = <D extends object>(name: string) =>
  useSyncExternalStore(
    subscribe,
    () => snapshot(name),
    () => EMPTY
  ) as Partial<D>

/**
 * A multi-step flow whose step is in the URL (back and refresh work) and whose
 * answers live in this tab's sessionStorage. Passwords never go in `data`.
 * A step that isn't reachable yet falls back to the last one that is.
 */
export function useFlow<S extends string, D extends object>(
  name: string,
  steps: readonly [S, ...S[]],
  reachable: (step: S, data: Partial<D>) => boolean
) {
  const [params, setParams] = useSearchParams()
  const data = useFlowData<D>(name)
  const [direction, setDirection] = useState<1 | -1>(1)

  const requested = steps.indexOf(params.get("step") as S)
  let index = 0
  while (
    index < Math.max(requested, 0) &&
    reachable(steps[index + 1] ?? steps[0], data)
  )
    index++
  const step = steps[index] ?? steps[0]

  const urlStep = params.get("step")
  useEffect(() => {
    if (urlStep !== null && urlStep !== step) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set("step", step)
          return next
        },
        { replace: true }
      )
    }
  }, [urlStep, step, setParams])

  useEffect(
    () => () => {
      if (readRaw(name) === null) snapshots.delete(name)
    },
    [name]
  )

  const update = (patch: Partial<D>) => {
    save(name, { ...snapshot(name), ...patch })
  }

  const go = (target: S, { replace = false } = {}) => {
    setDirection(steps.indexOf(target) < index ? -1 : 1)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("step", target)
        return next
      },
      { replace, preventScrollReset: true }
    )
  }

  const back = () => {
    go(steps[index - 1] ?? steps[0])
  }

  const forget = () => {
    try {
      sessionStorage.removeItem(PREFIX + name)
    } catch {
      /* empty */
    }
  }

  return { step, index, direction, data, update, go, back, forget }
}
