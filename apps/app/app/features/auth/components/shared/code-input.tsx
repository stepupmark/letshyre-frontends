import { cn } from "@workspace/ui/lib/utils"
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp"
import { useContext } from "react"

type State = "idle" | "invalid" | "verified"

/** Six separate digit boxes; paste and one-time-code autofill fill them all. */
export function CodeInput({
  id,
  length,
  value,
  state,
  disabled,
  describedBy,
  onChange,
  onComplete,
}: {
  id: string
  length: number
  value: string
  state: State
  disabled: boolean
  describedBy: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
}) {
  return (
    <OTPInput
      id={id}
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      value={value}
      disabled={disabled}
      aria-invalid={state === "invalid"}
      aria-describedby={describedBy}
      onChange={onChange}
      onComplete={onComplete}
      className="disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Slots length={length} state={state} disabled={disabled} />
      </div>
    </OTPInput>
  )
}

function Slots({
  length,
  state,
  disabled,
}: {
  length: number
  state: State
  disabled: boolean
}) {
  const slots = useContext(OTPInputContext).slots
  const half = Math.ceil(length / 2)

  return slots.map((slot, index) => (
    <div key={index} className="contents">
      {index === half && (
        <span
          aria-hidden="true"
          className="h-0.5 w-2.5 rounded-full bg-border"
        />
      )}
      <div
        className={cn(
          "relative grid h-13 w-11 place-items-center rounded-xl border bg-background text-xl font-semibold tabular-nums shadow-xs transition-[border-color,box-shadow,background-color] duration-150 sm:h-14 sm:w-12",
          slot.char && "border-foreground/30",
          slot.isActive && "z-10 border-ring ring-3 ring-ring/30",
          state === "invalid" && "border-danger",
          state === "invalid" && slot.isActive && "ring-danger/20",
          state === "verified" &&
            "border-success bg-success-muted text-success",
          disabled && state !== "verified" && "bg-muted text-muted-foreground"
        )}
      >
        {slot.char && (
          <span key={slot.char} className="pop">
            {slot.char}
          </span>
        )}
        {slot.hasFakeCaret && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-6 w-px animate-caret-blink bg-foreground"
          />
        )}
      </div>
    </div>
  ))
}
