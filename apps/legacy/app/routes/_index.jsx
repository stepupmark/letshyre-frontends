import { redirect } from "react-router";
import { preferredLocale } from "@/i18n/hooks";

// Bare "/" has no content of its own — send it to the visitor's preferred
// locale. In prod nginx 301s "/" to /en first; this covers dev and client
// navigation.
export function clientLoader() {
  return redirect(`/${preferredLocale()}`);
}

export default function RootIndex() {
  return null;
}
