import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_singleFetch: true,
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
      },
      ssr: false,
      basename: "/",
      buildDirectory: "build",
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
  build: {
    target: "esnext",
    minify: true,
    outDir: "build/client",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        format: "es",
        manualChunks: undefined,
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  esbuild: {
    target: "esnext",
  },
});
