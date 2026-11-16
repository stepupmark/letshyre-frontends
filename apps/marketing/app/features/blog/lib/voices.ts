const NATURAL = /natural|neural|online|enhanced|premium|^google/i

const tag = (voice: SpeechSynthesisVoice) =>
  voice.lang.replace("_", "-").toLowerCase()

// network and downloaded neural voices sound human; the old built-in ones don't
const quality = (voice: SpeechSynthesisVoice) =>
  NATURAL.test(voice.name) ? 2 : voice.localService ? 0 : 1

/** The voices for a language, best first: quality, then the reader's region, then the default. */
export function rankVoices(
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
  preferred: readonly string[]
): SpeechSynthesisVoice[] {
  const wanted = preferred.map((p) => p.toLowerCase())
  const score = (voice: SpeechSynthesisVoice) =>
    quality(voice) * 4 +
    (wanted.includes(tag(voice)) ? 2 : 0) +
    (voice.default ? 1 : 0)
  return voices
    .filter((voice) => tag(voice).split("-")[0] === lang)
    .map((voice, i) => ({ voice, i, score: score(voice) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ voice }) => voice)
}
