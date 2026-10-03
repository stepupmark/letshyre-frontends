import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useEditJobForm } from "./useEditJobForm";

vi.mock("@/lib/toast", () => ({ showError: vi.fn(), showSuccess: vi.fn() }));

const t = (key) => key;
const baseJob = {
  id: "job-1",
  title: "Engineer",
  description: "Build things",
  number_of_openings: 2,
  responsibilities: [],
};

let mutate;
beforeEach(() => {
  mutate = vi.fn();
});

const setup = (job) =>
  renderHook(() =>
    useEditJobForm({ job: { ...baseJob, ...job }, onClose: vi.fn(), updateMutation: { mutate }, rawIndustries: [], t }),
  );

const change = (result, field, value) =>
  act(() => result.current.set(field)({ target: { value } }));

const save = (result) => {
  act(() => result.current.handleUpdate());
  return mutate.mock.calls.at(-1)?.[0].payload;
};

describe("useEditJobForm ranges", () => {
  it("keeps a zero minimum through load and save", () => {
    const { result } = setup({ experience_min_years: 0, experience_max_years: 2 });
    expect(result.current.editingJob.experience_min_years).toBe(0);

    const payload = save(result);
    expect(payload.experience_min_years).toBe(0);
    expect(payload.experience_required).toBe("0-2 years");
  });

  it("treats a 0–0 salary as not disclosed", () => {
    const { result } = setup({ salary_min_lpa: 0, salary_max_lpa: 0, salary_range: "0 - 0 LPA" });
    expect(result.current.editingJob.salary_min_lpa).toBe("");
    expect(result.current.salaryRange).toBe("");

    const payload = save(result);
    expect(payload.salary_min_lpa).toBeNull();
    expect(payload.salary_range).toBe("");
  });

  it("fills the numbers from an older job's text", () => {
    const { result } = setup({ salary_range: "10 - 15 LPA", experience_required: "Up to 5 years" });
    expect(result.current.editingJob.salary_min_lpa).toBe(10);
    expect(result.current.editingJob.salary_max_lpa).toBe(15);
    expect(result.current.editingJob.experience_max_years).toBe(5);
  });

  it("keeps text it can't read until numbers are entered", () => {
    const { result } = setup({ salary_range: "Competitive" });
    expect(result.current.salaryRange).toBe("Competitive");
    expect(save(result).salary_range).toBe("Competitive");

    change(result, "salary_min_lpa", "8");
    change(result, "salary_max_lpa", "12");
    expect(save(result).salary_range).toBe("8 - 12 LPA");
  });

  it("builds the text from edited numbers", () => {
    const { result } = setup({ salary_min_lpa: 10, salary_max_lpa: 15, salary_range: "10 - 15 LPA" });
    change(result, "salary_max_lpa", "20");
    const payload = save(result);
    expect(payload.salary_max_lpa).toBe(20);
    expect(payload.salary_range).toBe("10 - 20 LPA");
  });
});

describe("useEditJobForm step 2 validation", () => {
  const goToStep2 = (result) => act(() => result.current.nextStep());

  it("blocks a minimum above the maximum", () => {
    const { result } = setup({ salary_min_lpa: 20, salary_max_lpa: 10 });
    goToStep2(result);
    act(() => result.current.nextStep());

    expect(result.current.currentStep).toBe(2);
    expect(result.current.errors.salary_max_lpa).toBe("editJob.errors.salaryOrder");
  });

  it("rejects fractional years and out-of-range values", () => {
    const { result } = setup({ experience_min_years: 1.5, salary_max_lpa: 900 });
    goToStep2(result);
    act(() => result.current.nextStep());

    expect(result.current.errors.experience_min_years).toBe("editJob.errors.experienceInvalid");
    expect(result.current.errors.salary_max_lpa).toBe("editJob.errors.salaryInvalid");
  });

  it("clears both errors of a pair when either side changes", () => {
    const { result } = setup({ experience_min_years: 5, experience_max_years: 2 });
    goToStep2(result);
    act(() => result.current.nextStep());
    expect(result.current.errors.experience_max_years).toBeTruthy();

    change(result, "experience_min_years", "1");
    expect(result.current.errors.experience_max_years).toBeFalsy();
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(3);
  });
});
