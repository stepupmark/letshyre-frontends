// Plain Node scripts only see process.env. Load the same .env files Vite reads
// for a production build, so they agree with the app bundle. Shell values win.
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("production", process.cwd(), "VITE_"));
