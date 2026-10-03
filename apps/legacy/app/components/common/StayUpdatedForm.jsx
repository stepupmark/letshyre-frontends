import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStayUpdated } from "@/hooks/useStayUpdated";

/*
 * The `.ft-*` classes here came from footer.css, which has been deleted — this
 * form is only ever rendered inside the footer.
 *
 * Two accessibility additions: the input had no accessible name (a placeholder
 * is not one), and the submit button's only content is an envelope glyph,
 * which screen readers announce as nothing useful. Both now carry aria-labels.
 */
export function StayUpdatedForm() {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();
  const { mutate: subscribe, isPending } = useStayUpdated();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }
    subscribe(email, {
      onSuccess: () => {
        setEmail("");
      },
    });
  };

  return (
    <form
      className="mt-3.5 flex overflow-hidden rounded-[10px] border border-neutral-500"
      onSubmit={handleSubscribe}
    >
      <input
        type="email"
        placeholder={t("newsletter.emailPlaceholder")}
        aria-label={t("newsletter.emailLabel")}
        className="flex-1 border-none bg-transparent px-3.5 py-2.5 text-border outline-none disabled:cursor-not-allowed disabled:opacity-60"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
        required
      />
      <button
        type="submit"
        aria-label={t("newsletter.subscribe")}
        className="flex w-[45px] cursor-pointer items-center justify-center border-none bg-[linear-gradient(130deg,rgb(116,142,168),var(--color-brand-400))] disabled:cursor-not-allowed disabled:opacity-80"
        disabled={isPending}
      >
        {isPending ? (
          // `ft-spin` was a verbatim copy of Tailwind's own spin keyframe.
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span aria-hidden="true">✉</span>
        )}
      </button>
    </form>
  );
}
