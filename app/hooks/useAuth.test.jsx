import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import authService from "@/services/auth.service";
import { queryWrapper } from "@/test/helpers";
import { toast } from "@/lib/toast";
import { useLoginMutation } from "./useAuth";

vi.mock("@/services/auth.service", () => ({ default: { login: vi.fn() } }));
vi.mock("@/lib/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function Harness() {
  const login = useLoginMutation();
  const { pathname, search } = useLocation();
  return (
    <>
      <button type="button" onClick={() => login.mutate({})}>
        sign in
      </button>
      <output data-testid="location">{pathname + search}</output>
    </>
  );
}

const signInFrom = async (from) => {
  const { client } = queryWrapper();
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ pathname: "/employer/sign-in", state: { from } }]}>
        <Routes>
          <Route path="*" element={<Harness />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "sign in" }));
};

const location = () => screen.getByTestId("location").textContent;

beforeEach(() => {
  vi.mocked(authService.login).mockResolvedValue({ role: "Employer", is_profile_completed: true });
});

describe("useLoginMutation redirect", () => {
  it("returns to the page and query the sign-in came from", async () => {
    await signInFrom({ pathname: "/en/pricing", search: "?checkout=business" });
    await waitFor(() => expect(location()).toBe("/en/pricing?checkout=business"));
  });

  it("ignores a search that isn't a query string", async () => {
    await signInFrom({ pathname: "/en/pricing", search: "//evil.example" });
    await waitFor(() => expect(location()).toBe("/en/pricing"));
  });

  it("shows a short success toast", async () => {
    await signInFrom(undefined);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(expect.any(String), { duration: 2000 }));
  });

  it("won't redirect off the site", async () => {
    await signInFrom({ pathname: "//evil.example", search: "?checkout=business" });
    await waitFor(() => expect(location()).toBe("/employer"));
  });
});
