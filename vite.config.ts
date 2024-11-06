import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import ElementPlus from "unplugin-element-plus/vite";
import SvgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "@vueuse/core"],
      dts: "src/auto-import.d.ts",
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: "src/component.d.ts",
    }),
    ElementPlus({}),
    SvgLoader({
      defaultImport: "url",
      svgo: true,
    }),
  ],
  base: "/project-demos/",

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vender: ["vue", "@vueuse/core"],
          ol: ["ol"],
          x6: ["@antv/x6"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
