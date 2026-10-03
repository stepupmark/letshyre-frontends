import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { FormSelect } from "./FormSelect";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("FormSelect", () => {
  it("doesn't report an empty value when the value lands before its items", async () => {
    const onValueChange = vi.fn();
    const view = render(
      <form>
        <FormSelect value="" onValueChange={onValueChange} options={[]} placeholder="Pick" />
      </form>,
    );
    view.rerender(
      <form>
        <FormSelect value="b" onValueChange={onValueChange} options={OPTIONS} placeholder="Pick" />
      </form>,
    );
    await act(async () => {});

    expect(onValueChange).not.toHaveBeenCalledWith("");
    expect(screen.getByRole("combobox")).toHaveTextContent("Beta");
  });
});
