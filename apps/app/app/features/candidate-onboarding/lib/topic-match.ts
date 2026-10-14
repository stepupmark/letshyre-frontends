const words = (text: string): string[] =>
  text.toLowerCase().match(/[\p{L}\p{N}+#]+/gu) ?? []

/** Whether any resume skill covers an interview topic, by whole words so "Go" isn't "Google". */
export function topicMatcher(skills: string[]) {
  const known = skills.map(words).filter((skill) => skill.length > 0)
  return (topic: string) => {
    const topicWords = words(topic)
    return known.some(
      (skill) =>
        skill.every((w) => topicWords.includes(w)) ||
        topicWords.every((w) => skill.includes(w))
    )
  }
}
