type Topic = "about" | "employers" | "seekers"

export type Prompt =
  | "what"
  | "free"
  | "employersHow"
  | "employersCost"
  | "employersInterview"
  | "seekersHow"
  | "seekersInterview"
  | "seekersProfile"

export const TOPICS: [Topic, Prompt[]][] = [
  ["about", ["what", "free"]],
  ["employers", ["employersHow", "employersCost", "employersInterview"]],
  ["seekers", ["seekersHow", "seekersInterview", "seekersProfile"]],
]

// the welcome lists two per topic; the rest come back as follow-ups
export const welcomePrompts = (prompts: Prompt[]) => prompts.slice(0, 2)

export const topicOf = (prompt: Prompt) =>
  TOPICS.find(([, prompts]) => prompts.includes(prompt))?.[0]

/** Unasked questions from the topic of the last one, then from the rest. */
export function nextPrompts(last: Prompt | undefined, asked: Set<Prompt>) {
  const home = TOPICS.find(([, prompts]) => last && prompts.includes(last))
  const order = home ? [home, ...TOPICS.filter((t) => t !== home)] : TOPICS
  return order
    .flatMap(([, prompts]) => prompts)
    .filter((prompt) => !asked.has(prompt))
    .slice(0, 2)
}
