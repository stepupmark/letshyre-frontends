import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast as sonner } from "sonner";
import { TOAST_DURATION, showError, toast } from "./toast";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));

const message = "hello";

beforeEach(() => vi.clearAllMocks());

describe("toast", () => {
  it.each(["success", "info", "warning", "error"])("gives %s toasts their default duration", (type) => {
    toast[type](message);
    expect(sonner[type]).toHaveBeenCalledWith(message, { duration: TOAST_DURATION[type] });
  });

  it("keeps errors up longer than confirmations", () => {
    expect(TOAST_DURATION.error).toBeGreaterThan(TOAST_DURATION.success);
  });

  it("lets a call override the duration and pass other options", () => {
    toast.success(message, { duration: 2000, id: "login" });
    expect(sonner.success).toHaveBeenCalledWith(message, { duration: 2000, id: "login" });
  });

  it("keeps the show* helpers on the same defaults", () => {
    showError(message);
    expect(sonner.error).toHaveBeenCalledWith(message, { duration: TOAST_DURATION.error });
  });
});
