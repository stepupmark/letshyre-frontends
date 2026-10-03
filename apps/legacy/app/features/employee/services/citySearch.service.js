const CITIES_URL = "https://geodb-free-service.wirefreethought.com/v1/geo/cities";

const REQUEST_TIMEOUT_MS = 8000;

// Deliberately a bare fetch rather than the shared axios client: this is a
// third-party host and that client attaches our auth headers.
export async function searchCities(namePrefix, { signal, limit = 5 } = {}) {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const res = await fetch(
    `${CITIES_URL}?limit=${limit}&namePrefix=${encodeURIComponent(namePrefix)}`,
    { signal: signal ? AbortSignal.any([signal, timeout]) : timeout },
  );
  if (!res.ok) return [];
  const body = await res.json();
  return body.data ?? [];
}
