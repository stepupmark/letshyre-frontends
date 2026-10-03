import { describe, expect, it } from "vitest";
import { tStub } from "@/test/helpers";
import { makeShareLinkSchemas } from "./shareLink.schema";

const { createShareLinkSchema, editShareLinkSchema } = makeShareLinkSchemas(tStub);

const create = { job_id: "job-1", expires_in_days: 7, max_views: 10 };
const edit = { extend_expiry_days: 7, max_views: 10, is_active: true };

const keyFor = (schema, data, field) =>
  schema.safeParse(data).error?.issues.find((i) => i.path[0] === field)?.message;

describe("createShareLinkSchema", () => {
  it("accepts a filled form", () => {
    expect(createShareLinkSchema.safeParse(create).success).toBe(true);
  });

  it("coerces the numeric fields a form submits as strings", () => {
    const parsed = createShareLinkSchema.safeParse({
      ...create,
      expires_in_days: "7",
      max_views: "10",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.expires_in_days).toBe(7);
  });

  it("requires a job", () => {
    expect(keyFor(createShareLinkSchema, { ...create, job_id: "" }, "job_id")).toBe(
      "sharing.validation.jobRequired",
    );
  });

  it.each([
    [0, "sharing.validation.expiryMin"],
    [31, "sharing.validation.expiryMax"],
  ])("holds expiry inside the server's 1-30 day window (%i)", (days, key) => {
    expect(
      keyFor(createShareLinkSchema, { ...create, expires_in_days: days }, "expires_in_days"),
    ).toBe(key);
  });

  it("keeps expiry whole — a fractional day has no meaning server-side", () => {
    expect(
      keyFor(createShareLinkSchema, { ...create, expires_in_days: 1.5 }, "expires_in_days"),
    ).toBe("sharing.validation.expiryInt");
  });

  it("rejects a link nobody can open", () => {
    expect(keyFor(createShareLinkSchema, { ...create, max_views: 0 }, "max_views")).toBe(
      "sharing.validation.maxViewsMin",
    );
  });
});

describe("editShareLinkSchema", () => {
  it("accepts a filled form", () => {
    expect(editShareLinkSchema.safeParse(edit).success).toBe(true);
  });

  it("allows a zero-day extension, unlike creation", () => {
    // Editing only max_views or is_active must not force an expiry bump.
    expect(
      editShareLinkSchema.safeParse({ ...edit, extend_expiry_days: 0 }).success,
    ).toBe(true);
  });

  it("caps the extension at the server's 30 days", () => {
    expect(
      keyFor(editShareLinkSchema, { ...edit, extend_expiry_days: 31 }, "extend_expiry_days"),
    ).toBe("sharing.validation.extendMax");
  });

  it("requires the active flag", () => {
    expect(editShareLinkSchema.safeParse({ ...edit, is_active: undefined }).success).toBe(
      false,
    );
  });
});
