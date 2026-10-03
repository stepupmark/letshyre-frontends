import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const useCandidateInterviews = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts?.count === undefined ? key : `${key}:${opts.count}`),
  }),
}));

vi.mock("@/features/employer/hooks/useCandidatePool", () => ({
  useCandidateInterviews: (...args) => useCandidateInterviews(...args),
}));

const UnlockProfileModal = (await import("./UnlockProfileModal")).default;

const candidate = {
  id: "cand-1",
  name: "Ada Lovelace",
  avatar: "AL",
  roles: [{ role: "Backend Engineer", score: 82 }],
};

const primaryInterview = {
  interview_id: "int-primary",
  role: "Backend Engineer",
  score: 82.4,
  unlocked: false,
};

const extraInterview = {
  interview_id: "int-extra",
  role: "Data Engineer",
  score: 71,
  unlocked: false,
};

const setInterviews = (data, isLoading = false) =>
  useCandidateInterviews.mockReturnValue({ data, isLoading });

const renderModal = (props = {}) =>
  render(
    <UnlockProfileModal
      candidate={candidate}
      onClose={vi.fn()}
      onUnlock={vi.fn()}
      isUnlocking={false}
      {...props}
    />,
  );

const confirmButton = () => screen.getByRole("button", { name: /unlockFor/ });

beforeEach(() => {
  vi.clearAllMocks();
  setInterviews([primaryInterview, extraInterview]);
});

describe("UnlockProfileModal", () => {
  it("opens with nothing selected and no way to spend credits", () => {
    renderModal();
    expect(confirmButton()).toBeDisabled();
    expect(confirmButton()).toHaveTextContent("unlockFor:0");
  });

  it("charges one credit per selected interview", async () => {
    const user = userEvent.setup();
    renderModal();

    const [primary, extra] = screen.getAllByRole("checkbox");
    await user.click(primary);
    expect(confirmButton()).toHaveTextContent("unlockFor:1");

    await user.click(extra);
    expect(confirmButton()).toHaveTextContent("unlockFor:2");
  });

  it("stops charging for an interview the employer deselects", async () => {
    const user = userEvent.setup();
    renderModal();

    const primary = screen.getAllByRole("checkbox")[0];
    await user.click(primary);
    await user.click(primary);

    expect(confirmButton()).toHaveTextContent("unlockFor:0");
    expect(confirmButton()).toBeDisabled();
  });

  it("hands the confirmed selection and its cost to the caller", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    renderModal({ onUnlock });

    await user.click(screen.getAllByRole("checkbox")[0]);
    await user.click(confirmButton());

    expect(onUnlock).toHaveBeenCalledWith("cand-1", ["int-primary"], 1);
  });

  it("will not re-charge for an interview that is already unlocked", async () => {
    // Paying twice for the same scorecard is the failure worth guarding.
    const user = userEvent.setup();
    setInterviews([
      { ...primaryInterview, unlocked: true },
      { ...extraInterview, unlocked: true },
    ]);
    renderModal();

    const boxes = screen.getAllByRole("checkbox");
    boxes.forEach((box) => expect(box).toBeDisabled());

    await user.click(screen.getByText("Data Engineer").closest("div[class]"));
    expect(confirmButton()).toHaveTextContent("unlockFor:0");
    expect(confirmButton()).toBeDisabled();
  });

  it("blocks a second submit while the first is in flight", () => {
    renderModal({ isUnlocking: true });
    expect(screen.getByRole("button", { name: "pool.unlockModal.unlocking" })).toBeDisabled();
  });

  it("waits for the interview list before offering anything to buy", () => {
    setInterviews([], true);
    renderModal();
    expect(screen.getByText("pool.unlockModal.loadingInterviews")).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it("keeps the primary interview out of the extras list", () => {
    // It is matched on role plus rounded score, then shown in its own box.
    renderModal();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText("Data Engineer")).toBeInTheDocument();
  });
});
