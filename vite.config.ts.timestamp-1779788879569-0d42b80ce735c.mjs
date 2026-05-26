// vite.config.ts
import path from "path";
import { readFileSync } from "fs";
import checker from "file:///D:/Personnel/PROJETS/demos/demos/communaute/frond/node_modules/vite-plugin-checker/dist/esm/main.js";
import { defineConfig } from "file:///D:/Personnel/PROJETS/demos/demos/communaute/frond/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Personnel/PROJETS/demos/demos/communaute/frond/node_modules/@vitejs/plugin-react-swc/index.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/Personnel/PROJETS/demos/demos/communaute/frond/vite.config.ts";
var PORT = 3039;
var packageJson = JSON.parse(readFileSync(new URL("./package.json", __vite_injected_original_import_meta_url), "utf-8"));
var appBuildDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
}).format(/* @__PURE__ */ new Date());
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ["error"] }
      },
      overlay: {
        position: "tl",
        initialIsOpen: false
      }
    })
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), "node_modules/$1")
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), "src/$1")
      }
    ]
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version || "1.0.0"),
    __APP_BUILD_DATE__: JSON.stringify(appBuildDate)
  },
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : {},
  // Configuration importante pour Vercel
  build: {
    outDir: "dist",
    sourcemap: false
    // Désactivez les sourcemaps pour une build plus rapide
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQZXJzb25uZWxcXFxcUFJPSkVUU1xcXFxkZW1vc1xcXFxkZW1vc1xcXFxjb21tdW5hdXRlXFxcXGZyb25kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQZXJzb25uZWxcXFxcUFJPSkVUU1xcXFxkZW1vc1xcXFxkZW1vc1xcXFxjb21tdW5hdXRlXFxcXGZyb25kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QZXJzb25uZWwvUFJPSkVUUy9kZW1vcy9kZW1vcy9jb21tdW5hdXRlL2Zyb25kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUE9SVCA9IDMwMzk7XG5jb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKG5ldyBVUkwoJy4vcGFja2FnZS5qc29uJywgaW1wb3J0Lm1ldGEudXJsKSwgJ3V0Zi04JykpO1xuY29uc3QgYXBwQnVpbGREYXRlID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2ZyLUZSJywge1xuICBkYXk6ICcyLWRpZ2l0JyxcbiAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgeWVhcjogJ251bWVyaWMnLFxufSkuZm9ybWF0KG5ldyBEYXRlKCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcclxuICAgIGNoZWNrZXIoe1xyXG4gICAgICB0eXBlc2NyaXB0OiB0cnVlLFxyXG4gICAgICBlc2xpbnQ6IHtcclxuICAgICAgICBsaW50Q29tbWFuZDogJ2VzbGludCBcIi4vc3JjLyoqLyoue2pzLGpzeCx0cyx0c3h9XCInLFxyXG4gICAgICAgIGRldjogeyBsb2dMZXZlbDogWydlcnJvciddIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIG92ZXJsYXk6IHtcclxuICAgICAgICBwb3NpdGlvbjogJ3RsJyxcclxuICAgICAgICBpbml0aWFsSXNPcGVuOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6IC9efiguKykvLFxyXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcy8kMScpLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogL15zcmMoLispLyxcclxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzcmMvJDEnKSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcbiAgc2VydmVyOiB7IHBvcnQ6IFBPUlQsIGhvc3Q6IHRydWUgfSxcbiAgcHJldmlldzogeyBwb3J0OiBQT1JULCBob3N0OiB0cnVlIH0sXG4gIGRlZmluZToge1xuICAgIF9fQVBQX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkocGFja2FnZUpzb24udmVyc2lvbiB8fCAnMS4wLjAnKSxcbiAgICBfX0FQUF9CVUlMRF9EQVRFX186IEpTT04uc3RyaW5naWZ5KGFwcEJ1aWxkRGF0ZSksXG4gIH0sXG4gIGVzYnVpbGQ6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IHsgZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10gfSA6IHt9LFxuICAgLy8gQ29uZmlndXJhdGlvbiBpbXBvcnRhbnRlIHBvdXIgVmVyY2VsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBEXHUwMEU5c2FjdGl2ZXogbGVzIHNvdXJjZW1hcHMgcG91ciB1bmUgYnVpbGQgcGx1cyByYXBpZGVcclxuICB9LFxyXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1WLE9BQU8sVUFBVTtBQUNwVyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBSnFNLElBQU0sMkNBQTJDO0FBUXhRLElBQU0sT0FBTztBQUNiLElBQU0sY0FBYyxLQUFLLE1BQU0sYUFBYSxJQUFJLElBQUksa0JBQWtCLHdDQUFlLEdBQUcsT0FBTyxDQUFDO0FBQ2hHLElBQU0sZUFBZSxJQUFJLEtBQUssZUFBZSxTQUFTO0FBQUEsRUFDcEQsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUNSLENBQUMsRUFBRSxPQUFPLG9CQUFJLEtBQUssQ0FBQztBQUVwQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLFFBQVE7QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFO0FBQUEsTUFDN0I7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLFVBQVU7QUFBQSxRQUNWLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxpQkFBaUI7QUFBQSxNQUN6RDtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsS0FBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLFFBQVE7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRLEVBQUUsTUFBTSxNQUFNLE1BQU0sS0FBSztBQUFBLEVBQ2pDLFNBQVMsRUFBRSxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUEsRUFDbEMsUUFBUTtBQUFBLElBQ04saUJBQWlCLEtBQUssVUFBVSxZQUFZLFdBQVcsT0FBTztBQUFBLElBQzlELG9CQUFvQixLQUFLLFVBQVUsWUFBWTtBQUFBLEVBQ2pEO0FBQUEsRUFDQSxTQUFTLFNBQVMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxXQUFXLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRXRFLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQTtBQUFBLEVBQ2I7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
