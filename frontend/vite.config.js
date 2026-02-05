import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      headers: {
        // --- FIX FOR GOOGLE LOGIN & COOP ERRORS ---
        // Allows the Google Popup to communicate back to the window
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        // Ensures the browser doesn't block the embedding
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
    },
  };
});
