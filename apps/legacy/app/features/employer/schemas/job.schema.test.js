import { describe, expect, it } from "vitest";
import { tStub } from "@/test/helpers";
import { makeJobSchema } from "./job.schema";

const schema = makeJobSchema(tStub);

const valid = {
  title: "Backend Engineer",
  work_type: "remote",
  employment_type: "full-time",
  industry_type: "software",
  must_have_skills: "Python, Django",
  salary_range: "10-15 LPA",
  country: "India",
  state: "Telangana",
  city: "Hyderabad",
  education: "B.Tech",
  specialization: "CSE",
  description: "Build and maintain services.",
  job_description: "Full description of the role.",
  experience_required: "3-5 years",
  number_of_openings: 2,
  application_deadline: "2026-12-31",
};

const keyFor = (data, field) =>
  schema.safeParse(data).error?.issues.find((i) => i.path[0] === field)?.message;

describe("makeJobSchema", () => {
  it("accepts a filled form", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("treats location and customIndustry as optional", () => {
    expect(schema.safeParse({ ...valid, location: undefined }).success).toBe(true);
  });

  it.each([
    "title",
    "work_type",
    "employment_type",
    "industry_type",
    "must_have_skills",
    "salary_range",
    "country",
    "state",
    "city",
    "education",
    "specialization",
    "description",
    "job_description",
    "experience_required",
    "application_deadline",
  ])("requires %s", (field) => {
    expect(keyFor({ ...valid, [field]: "" }, field)).toBeTruthy();
  });

  it("accepts openings as the string a number input yields", () => {
    expect(schema.safeParse({ ...valid, number_of_openings: "3" }).success).toBe(true);
  });

  it.each([0, -1, "0"])("rejects %j openings", (openings) => {
    expect(keyFor({ ...valid, number_of_openings: openings }, "number_of_openings")).toBe(
      "postJob.validation.openingsMin",
    );
  });

  describe("the 'other' industry branch", () => {
    it("demands a custom industry once 'other' is picked", () => {
      expect(
        keyFor({ ...valid, industry_type: "other", customIndustry: "" }, "customIndustry"),
      ).toBe("postJob.validation.customIndustryRequired");
    });

    it("does not accept whitespace as an answer", () => {
      expect(
        keyFor({ ...valid, industry_type: "other", customIndustry: "   " }, "customIndustry"),
      ).toBe("postJob.validation.customIndustryRequired");
    });

    it("accepts a real custom industry", () => {
      expect(
        schema.safeParse({ ...valid, industry_type: "other", customIndustry: "Agritech" })
          .success,
      ).toBe(true);
    });

    it("ignores a blank custom industry for any other selection", () => {
      expect(schema.safeParse({ ...valid, customIndustry: "" }).success).toBe(true);
    });
  });
});
