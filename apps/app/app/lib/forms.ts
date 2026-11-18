import type {
  FieldValues,
  Path,
  UseFormRegisterReturn,
  UseFormReturn,
} from "react-hook-form"

let pressing = false
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", () => (pressing = true), true)
  const release = () => (pressing = false)
  document.addEventListener("pointerup", release, true)
  document.addEventListener("pointercancel", release, true)
}

/**
 * Runs `check` after a press that took focus away has finished. An error that
 * appears or clears on blur moves the layout, and doing that between pointerdown
 * and click makes the click land beside the button that was pressed.
 */
export function afterPress(check: () => void) {
  if (!pressing) {
    check()
    return
  }
  document.addEventListener(
    "pointerup",
    () => {
      // the click fires after pointerup, in the same task
      setTimeout(check)
    },
    { once: true, capture: true }
  )
}

/**
 * register() that checks a field when it loses focus, but only once something
 * is typed: leaving an empty field isn't an error until submit. Pair with
 * `mode: "onSubmit"`.
 */
export function checkOnBlur<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
): UseFormRegisterReturn<Path<T>> {
  return form.register(name, {
    onBlur: (event: { target: { value?: unknown } }) => {
      if (!event.target.value) return
      afterPress(() => void form.trigger(name))
    },
  })
}
