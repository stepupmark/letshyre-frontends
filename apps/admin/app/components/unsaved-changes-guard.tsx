import { useEffect } from "react";
import { useBlocker } from "react-router";
import { ConfirmDialog } from "~/components/feedback/confirm-dialog";

export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.();
      }}
      title="Discard unsaved changes?"
      description="You've edited this form but haven't saved it. Leaving now throws those changes away."
      confirmLabel="Discard changes"
      destructive
      onConfirm={() => blocker.proceed?.()}
    />
  );
}
