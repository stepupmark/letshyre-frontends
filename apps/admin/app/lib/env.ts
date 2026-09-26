import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .url()
    .refine((url) => import.meta.env.DEV || url.startsWith("https://"), {
      message: "VITE_API_BASE_URL must use https outside development",
    })
    .transform((url) => (url.endsWith("/") ? url : `${url}/`)),
});

export const env = envSchema.parse(import.meta.env);
