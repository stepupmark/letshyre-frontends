import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { queryWrapper } from "@/test/helpers";
import { useQueryFailure } from "./useQueryFailure";

function setup(queryFn) {
  const { wrapper } = queryWrapper();
  return renderHook(
    () => {
      const query = useQuery({ queryKey: ["failure"], queryFn, retry: false });
      return { query, ...useQueryFailure(query) };
    },
    { wrapper },
  );
}

describe("useQueryFailure", () => {
  it("is not failed during the first load", () => {
    const { result } = setup(() => new Promise(() => {}));
    expect(result.current.failed).toBe(false);
  });

  it("keeps reporting the failure while a user retry is in flight", async () => {
    let resolve;
    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("down"))
      .mockImplementationOnce(() => new Promise((r) => (resolve = r)));
    const { result } = setup(queryFn);

    await waitFor(() => expect(result.current.failed).toBe(true));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.retrying).toBe(true));
    expect(result.current.query.isPending).toBe(true);
    expect(result.current.failed).toBe(true);

    await act(async () => resolve({ ok: true }));
    await waitFor(() => expect(result.current.failed).toBe(false));
    expect(result.current.retrying).toBe(false);
  });
});
