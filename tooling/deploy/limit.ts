/**
 * Runs `task` over `items`, `limit` at a time. After the first failure no new task starts; the ones
 * already running finish, then the failure is thrown.
 */
export async function eachLimited<T>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<void>
) {
  let next = 0
  let failure: { error: unknown } | undefined
  const worker = async () => {
    while (!failure && next < items.length) {
      const item = items[next++] as T
      try {
        await task(item)
      } catch (error) {
        failure ??= { error }
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  if (failure) throw failure.error
}
