// Wraps a route's prefetch clientLoader. A prefetch is an optimization and
// must never break a page, so this swallows fetch failures — the component's
// own useQuery re-requests the key and surfaces errors through its isError
// path — while re-throwing a Response, since that's router control flow
// (redirect/4xx), not a fetch failure.
//
// No auth/role check here: every caller sits under employer.jsx or
// employee.jsx, whose clientMiddleware already redirects unauthenticated or
// wrong-role visitors before any child loader — including this one — runs.
export function authedPrefetch(loader) {
  return async (args) => {
    try {
      return await loader(args);
    } catch (error) {
      if (error instanceof Response) throw error;

      if (import.meta.env.DEV) {
        console.warn(
          "[prefetch] warming the cache failed; the route will render and refetch:",
          error,
        );
      }
      return null;
    }
  };
}
