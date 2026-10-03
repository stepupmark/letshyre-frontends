import { describe, expect, it } from "vitest";
import { tStub } from "@/test/helpers";
import { makeContactSchema } from "./contact.schema";

const schema = makeContactSchema(tStub);

const valid = {
  name: "Ada",
  email: "ada@example.com",
  subject: "Hiring",
  message: "I would like to know more about your platform.",
};

const keyFor = (data, field) => {
  const result = schema.safeParse(data);
  return result.error?.issues.find((i) => i.path[0] === field)?.message;
};

describe("makeContactSchema", () => {
  it("accepts a filled form", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["name", "A", "form.validation.nameMin"],
    ["email", "not-an-email", "form.validation.emailInvalid"],
    ["subject", "Hi", "form.validation.subjectMin"],
    ["message", "Too short", "form.validation.messageMin"],
  ])("rejects %s with its own message", (field, value, key) => {
    expect(keyFor({ ...valid, [field]: value }, field)).toBe(key);
  });

  it("rejects whitespace-only text the same way as empty text", () => {
    expect(schema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});
