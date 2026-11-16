import { expect, it } from "vitest"

import { rankVoices } from "./voices"

const voice = (
  name: string,
  lang: string,
  localService = true,
  isDefault = false
) =>
  ({
    name,
    lang,
    localService,
    default: isDefault,
    voiceURI: name,
  }) as SpeechSynthesisVoice

it("puts natural voices first, then the reader's region, then the default", () => {
  const voices = [
    voice("Microsoft Ravi", "en-IN", true, true),
    voice("Microsoft Aria Online (Natural)", "en-US", false),
    voice("Microsoft Neerja Online (Natural)", "en_IN", false),
    voice("Google UK English Female", "en-GB", false),
    voice("Microsoft Zira", "en-US"),
    voice("Lekha", "hi-IN"),
  ]

  expect(rankVoices(voices, "en", ["en-IN"]).map((v) => v.name)).toEqual([
    "Microsoft Neerja Online (Natural)",
    "Microsoft Aria Online (Natural)",
    "Google UK English Female",
    "Microsoft Ravi",
    "Microsoft Zira",
  ])
})
