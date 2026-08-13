import { redirect } from "react-router";
import { TOKEN_KEY } from "../context/AuthContext.tsx";

export function publicLoader() {
  return localStorage.getItem(TOKEN_KEY) ? redirect("/dashboard") : null;
}
