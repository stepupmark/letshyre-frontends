import { toast as sonner } from "sonner";

// Every toast goes through here so durations stay consistent. Errors stay up
// longest since they usually say what to fix. A call can still pass its own
// duration.
export const TOAST_DURATION = { success: 3000, info: 3000, warning: 4000, error: 6000 };

const withDuration = (type) => (message, options) =>
  sonner[type](message, { duration: TOAST_DURATION[type], ...options });

export const toast = {
  success: withDuration("success"),
  info: withDuration("info"),
  warning: withDuration("warning"),
  error: withDuration("error"),
  dismiss: sonner.dismiss,
};

export const showSuccess = toast.success;
export const showError = toast.error;
export const showInfo = toast.info;
export const showWarning = toast.warning;
