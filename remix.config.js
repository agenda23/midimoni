/** @type {import('@remix-run/dev').AppConfig} */
export default {
  future: {
    v3_singleFetch: true,
    v3_throwAbortReason: true,
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
  },
  ignoredRouteFiles: ["**/.*"],
  // Cloudflare Pages向けの設定
  serverModuleFormat: "esm",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
}; 