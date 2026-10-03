import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditJobModalStep2 } from "./EditJobModalStep2";

const t = (key, values) => (values?.value ? `${key}:${values.value}` : key);
const editingJob = {
  salary_min_lpa: 10,
  salary_max_lpa: "",
  experience_min_years: 0,
  experience_max_years: 2,
  openings: 1,
  location: "",
  country: "",
  state: "",
  city: "",
};

const renderStep = (props = {}) =>
  render(
    <EditJobModalStep2
      t={t}
      errors={{}}
      editingJob={editingJob}
      set={() => vi.fn()}
      salaryRange="10 LPA"
      experienceRange="0-2 years"
      {...props}
    />,
  );

describe("EditJobModalStep2", () => {
  it("groups min and max under salary and experience", () => {
    renderStep();
    expect(screen.getByRole("group", { name: "editJob.fields.salary" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "editJob.fields.experience" })).toBeInTheDocument();
    expect(screen.getByLabelText("editJob.fields.minimum", { selector: "#edit-exp-min" })).toHaveValue(0);
  });

  it("previews what candidates will see", () => {
    renderStep();
    expect(screen.getByText("editJob.fields.candidatesSee:10 LPA")).toBeInTheDocument();
    expect(screen.getByText("editJob.fields.candidatesSee:0-2 years")).toBeInTheDocument();
  });

  it("falls back to not disclosed when there's no salary", () => {
    renderStep({ salaryRange: "" });
    expect(screen.getByText("editJob.fields.candidatesSee:format.notDisclosed")).toBeInTheDocument();
  });

  it("ties errors and hints to their inputs", () => {
    renderStep({ errors: { salary_max_lpa: "too low" } });
    const max = document.getElementById("edit-salary-max");
    expect(max).toHaveAttribute("aria-invalid", "true");
    expect(max).toHaveAttribute("aria-describedby", "edit-salary-max-error");
    expect(document.getElementById("edit-location")).toHaveAttribute(
      "aria-describedby",
      "edit-location-help",
    );
  });
});
