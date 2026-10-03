import { useState } from "react";

// Refetching a failed query that has no data puts it back to pending, which would
// swap the error UI for a skeleton and drop focus from the retry button. While a
// retry the user started is in flight, keep reporting the failure.
export function useQueryFailure(query) {
  const [retrying, setRetrying] = useState(false);
  const inFlight = retrying && query.isFetching;

  const retry = () => {
    setRetrying(true);
    query.refetch().finally(() => setRetrying(false));
  };

  return {
    failed: query.data === undefined && (query.isError || inFlight),
    retry,
    retrying: inFlight,
  };
}
