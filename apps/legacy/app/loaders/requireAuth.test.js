import { describe, expect, it, vi } from "vitest";
import { getUser } from "@/lib/getUser";
import { requireAuth } from "./requireAuth";

vi.mock("@/lib/getUser", () => ({ getUser: vi.fn(), clearStoredUser: vi.fn() }));

const guard = requireAuth({ allowedRoles: ["Employer"] });

async function redirectFor(url) {
  try {
    await guard({ request: new Request(url) });
  } catch (response) {
    return response.headers.get("Location");
  }
  return null;
}

describe("requireAuth when signed out", () => {
  it("sends billing to sign-in and back, keeping the checkout", async () => {
    vi.mocked(getUser).mockReturnValue({ isAuthenticated: false });
    const location = await redirectFor("https://letshyre.ai/employer/billing?checkout=business");
    expect(location).toBe(
      `/employer/sign-in?${new URLSearchParams({ next: "/employer/billing?checkout=business" })}`,
    );
  });

  it("sends every other page home", async () => {
    vi.mocked(getUser).mockReturnValue({ isAuthenticated: false });
    expect(await redirectFor("https://letshyre.ai/employer/invoice")).toBe("/");
  });

  it("lets a signed-in employer through", async () => {
    vi.mocked(getUser).mockReturnValue({
      isAuthenticated: true,
      role: "Employer",
      user: { is_profile_completed: true },
    });
    expect(await redirectFor("https://letshyre.ai/employer/billing")).toBeNull();
  });
});
