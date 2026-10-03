// Axios leaves `response` empty when the request never reached the server.
export function errorKind(error) {
  const status = error?.response?.status;
  if (status === 404) return "notFound";
  if (status === 403) return "forbidden";
  if (status) return "generic";

  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  if (error?.code === "ERR_NETWORK") return "unreachable";
  return "generic";
}
