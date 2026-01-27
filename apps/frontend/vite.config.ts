import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../../hexarchy/4-interface/ui/src"),
      "@ui-components": path.resolve(
        __dirname,
        "../../hexarchy/4-interface/ui/src/components"
      )
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: true
  }
});
