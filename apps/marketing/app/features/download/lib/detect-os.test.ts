import { describe, expect, it } from "vitest"

import { detectOs } from "./detect-os"

const UA = {
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
}

describe("detectOs", () => {
  it("prefers client hints when the browser has them", () => {
    expect(
      detectOs({ userAgent: UA.mac, userAgentData: { platform: "Windows" } })
    ).toBe("windows")
    expect(
      detectOs({ userAgent: "", userAgentData: { platform: "macOS" } })
    ).toBe("mac")
    expect(
      detectOs({ userAgent: "", userAgentData: { platform: "Linux" } })
    ).toBe("other")
    expect(
      detectOs({
        userAgent: "",
        userAgentData: { platform: "Android", mobile: true },
      })
    ).toBe("other")
  })

  it("falls back to the user agent string", () => {
    expect(detectOs({ userAgent: UA.windows })).toBe("windows")
    expect(detectOs({ userAgent: UA.mac })).toBe("mac")
    expect(detectOs({ userAgent: UA.linux })).toBe("other")
    expect(detectOs({ userAgent: UA.android })).toBe("other")
    expect(detectOs({ userAgent: UA.iphone })).toBe("other")
  })

  it("treats an iPad asking for the desktop site as a tablet", () => {
    expect(detectOs({ userAgent: UA.mac, maxTouchPoints: 5 })).toBe("other")
  })
})
