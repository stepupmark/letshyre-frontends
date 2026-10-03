import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/AuthField";

/**
 * Labeled password input with an accessible show/hide toggle, optional
 * Caps-Lock hint, and inline error. Shared across login / register / forgot.
 *
 * Driven by react-hook-form context — pass `name`, not `register`/`error`.
 * The shared scaffolding and input styling live in AuthField; this owns the
 * show/hide and Caps-Lock state.
 *
 * @param {{
 *   name: string, label: string,
 *   placeholder?: string, autoComplete?: string, capsHint?: boolean
 * }} props
 */
export function AuthPasswordField({
  name,
  label,
  placeholder = "••••••••",
  autoComplete = "new-password",
  capsHint = false,
}) {
  const { t } = useTranslation("auth");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  const syncCaps = (e) => {
    if (capsHint && typeof e.getModifierState === "function") {
      setCaps(e.getModifierState("CapsLock"));
    }
  };

  return (
    <AuthField
      name={name}
      label={label}
      type={show ? "text" : "password"}
      inputProps={{
        placeholder,
        autoComplete,
        onKeyUp: syncCaps,
        onKeyDown: syncCaps,
      }}
      trailing={
        <Button
          type="button"
          className="absolute top-1/2 end-2.5 flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-neutral-400 transition-colors hover:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? t("field.hidePassword") : t("field.showPassword")}
          aria-pressed={show}
          variant="link"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      }
      footer={
        capsHint && caps ? (
          <p className="m-0 text-start text-sm text-neutral-500" role="status">
            {t("field.capsLock")}
          </p>
        ) : null
      }
    />
  );
}
