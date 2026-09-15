import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

const vendorChunks: Record<string, string[]> = {
  markdown: [
    "react-markdown",
    "remark-",
    "rehype-",
    "micromark",
    "mdast-",
    "hast-",
    "unified",
    "highlight.js",
    "lowlight",
    "unist-",
    "vfile",
  ],
  supabase: ["@supabase"],
  motion: ["framer-motion", "motion-dom", "motion-utils"],
};

/** Replaces %SITE_URL% in index.html so static Open Graph tags carry an absolute image URL. */
function siteUrlPlugin(siteUrl: string): Plugin {
  return {
    name: "site-url-html",
    transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", siteUrl),
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = (env.VITE_SITE_URL || "https://fajar.codes").replace(
    /\/$/,
    "",
  );

  return {
    plugins: [react(), tailwindcss(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            for (const [chunk, needles] of Object.entries(vendorChunks)) {
              if (
                needles.some((needle) => id.includes(`node_modules/${needle}`))
              )
                return chunk;
            }
            return undefined;
          },
        },
      },
    },
  };
});
