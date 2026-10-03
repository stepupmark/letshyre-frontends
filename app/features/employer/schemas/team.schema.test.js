import { describe, expect, it } from "vitest";
import { tStub } from "@/test/helpers";
import { makeTeamSchemas } from "./team.schema";

const { memberSchema, addMemberSchema, editMemberSchema } = makeTeamSchemas(tStub);

const member = { full_name: "Ada Lovelace", email: "ada@example.com" };

const keyFor = (schema, data, field) =>
  schema.safeParse(data).error?.issues.find((i) => i.path[0] === field)?.message;

describe("memberSchema", () => {
  it("accepts a filled form", () => {
    expect(memberSchema.safeParse(member).success).toBe(true);
  });

  it.each([
    ["full_name", "A", "team.validation.nameMin"],
    ["full_name", "a".repeat(101), "team.validation.nameMax"],
    ["email", "not-an-email", "team.validation.emailInvalid"],
  ])("rejects %s %j", (field, value, key) => {
    expect(keyFor(memberSchema, { ...member, [field]: value }, field)).toBe(key);
  });
});

describe("addMemberSchema", () => {
  it("requires a password on top of the member fields", () => {
    expect(addMemberSchema.safeParse(member).success).toBe(false);
    expect(addMemberSchema.safeParse({ ...member, password: "secret1" }).success).toBe(true);
  });

  it.each([
    ["short", "team.validation.passwordMin"],
    ["a".repeat(51), "team.validation.passwordMax"],
  ])("rejects the password %j", (password, key) => {
    expect(keyFor(addMemberSchema, { ...member, password }, "password")).toBe(key);
  });
});

describe("editMemberSchema", () => {
  it("edits without a password, so an existing one is never overwritten blank", () => {
    expect(editMemberSchema.safeParse(member).success).toBe(true);
  });
});
