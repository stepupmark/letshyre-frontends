import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"

const PREFIX = "flow:v1:"

function load<D>(name: string): Partial<D> {
  try {
    const raw = sessionStorage.getItem(PREFIX + name)
    return raw ? (JSON.parse(raw) as Partial<D>) : {}
  } catch {
    return {}
  }
}

function store(name: string, data: unknown) {
  try {
    sessionStorage.setItem(PREFIX + name, JSON.stringify(data))
  } catch {
    /* a refresh will start the flow over */
  }
}

/**
 * A multi-step flow whose step is in the URL (back and refresh work) and whose
 * answers live in this tab's sessionStorage. Passwords never go in `data`.
 * A step that isn't reachable yet, e.g. a code step after a refresh lost the
 * code, falls back to the last one that is.
 */
export function useFlow<S extends string, D extends object>(
  name: string,
  steps: readonly [S, ...S[]],
  reachable: (step: S, data: Partial<D>) => boolean
) {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<Partial<D>>(() => load<D>(name))
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

  const update = (patch: Partial<D>) => {
    setData((current) => {
      const next = { ...current, ...patch }
      store(name, next)
      return next
    })
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

  /** Drops the saved answers; the screen keeps its state until it unmounts. */
  const forget = () => {
    try {
      sessionStorage.removeItem(PREFIX + name)
    } catch {
      /* empty */
    }
  }

  return {
    step,
    index,
    direction,
    data,
    update,
    go,
    back,
    forget,
  }
}
