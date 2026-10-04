import type {
  FieldValues,
  Path,
  UseFormRegisterReturn,
  UseFormReturn,
} from "react-hook-form"

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
      if (event.target.value) void form.trigger(name)
    },
  })
}
