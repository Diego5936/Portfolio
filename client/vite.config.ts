import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const devApiProxy = process.env.VITE_DEV_API_PROXY ?? "http://localhost:3001";
const clientRoot = path.dirname(fileURLToPath(import.meta.url));
const readmeAtRepoRoot = path.resolve(clientRoot, "../README.md");
const readmeInClient = path.resolve(clientRoot, "README.md");
const readmePath = fs.existsSync(readmeAtRepoRoot)
  ? readmeAtRepoRoot
  : readmeInClient;

function readmePlugin(readmeFile: string): Plugin {
  const virtualModuleId = "virtual:readme";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name: "portfolio-readme",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const source = fs.readFileSync(readmeFile, "utf-8");
        return `export default ${JSON.stringify(source)}`;
      }
    },
    configureServer(server) {
      server.watcher.add(readmeFile);
    },
    handleHotUpdate({ file, server }) {
      if (file === readmeFile) {
        const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (module) {
          server.reloadModule(module);
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), readmePlugin(readmePath)],
  server: {
    fs: {
      allow: [".."],
    },
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": devApiProxy,
      "/generated": devApiProxy,
    },
  },
});
