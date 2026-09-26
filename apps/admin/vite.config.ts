import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (
    command === "build" &&
    mode === "production" &&
    !env.VITE_API_BASE_URL?.startsWith("https://")
  ) {
    throw new Error(
      "VITE_API_BASE_URL must be an https URL for production builds",
    );
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      host: "localhost",
    },
  };
});
