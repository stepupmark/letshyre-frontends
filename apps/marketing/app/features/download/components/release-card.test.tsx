import { HttpError, NetworkError } from "@workspace/api"
import type * as publicApi from "@workspace/api/public"
import { type DesktopRelease, getLatestRelease } from "@workspace/api/public"
import { I18nProvider } from "@workspace/i18n/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import download from "@/locales/en/download.json"

import { ReleaseCard } from "./release-card"

vi.mock("@/lib/env", () => ({
  env: { VITE_API_BASE_URL: "https://api.example.test/" },
}))

vi.mock("@workspace/api/public", async (importOriginal) => ({
  ...(await importOriginal<typeof publicApi>()),
  getLatestRelease: vi.fn(),
}))

const latest = vi.mocked(getLatestRelease)

const windows: DesktopRelease = {
  platform: "windows",
  available: true,
  version: "1.4.4",
  filename: "LetsHyre-Setup-1.4.4.exe",
}

function renderCard(os: "windows" | "mac" = "windows") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <I18nProvider lang="en" messages={{ en: { download } }}>
      <QueryClientProvider client={client}>
        <ReleaseCard os={os} recommended />
      </QueryClientProvider>
    </I18nProvider>
  )
}

describe("ReleaseCard", () => {
  beforeEach(() => {
    latest.mockReset()
  })

  it("links straight to the installer when a build is out", async () => {
    latest.mockResolvedValue(windows)
    renderCard()

    expect(
      screen.getByText("Checking for the latest version…")
    ).toBeInTheDocument()
    const link = await screen.findByRole("link", {
      name: "Download for Windows",
    })
    expect(link).toHaveAttribute(
      "href",
      "https://api.example.test/commonapp/v1/desktop_app/windows/download/"
    )
    expect(
      screen.getByText("Version 1.4.4 · EXE installer")
    ).toBeInTheDocument()
    expect(screen.getByText("Your computer")).toBeInTheDocument()
  })

  it("says coming soon when the platform has no build", async () => {
    latest.mockRejectedValue(new HttpError(404))
    renderCard("mac")

    expect(await screen.findByText("Coming soon")).toBeInTheDocument()
    expect(screen.getByText("Not available yet")).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("offers a retry when the lookup fails", async () => {
    latest.mockRejectedValueOnce(new NetworkError("offline"))
    latest.mockResolvedValueOnce(windows)
    renderCard()

    await userEvent.click(
      await screen.findByRole("button", { name: "Retry Windows" })
    )
    expect(
      await screen.findByRole("link", { name: "Download for Windows" })
    ).toBeInTheDocument()
    expect(latest).toHaveBeenCalledTimes(2)
  })
})
