import type { AstroIntegration } from "astro";
import { readFileSync } from "node:fs";
import rehypeBeautifulMermaid from "./rehype-beautiful-mermaid";
import type { IntegrationOptions, ThemeSelectors } from "./types";

const DEFAULT_THEME_SELECTORS: ThemeSelectors = {
  light: ":root[data-theme=\"light\"]",
  dark: ":root[data-theme=\"dark\"]"
};

const buildCss = (selectors: ThemeSelectors) => {
  const baseCss = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const scopedCss = baseCss.replace(
    /:root\[data-theme="light"\]|:root\[data-theme="dark"\]/g,
    (match) => {
      return match.includes("light") ? selectors.light : selectors.dark;
    }
  );

  return `<style>${scopedCss}</style>`;
};

const beautifulMermaid = (options: IntegrationOptions = {}): AstroIntegration => {
  const themeSelectors: ThemeSelectors = {
    ...DEFAULT_THEME_SELECTORS,
    ...(options.themeSelectors ?? {})
  };

  return {
    name: "starlight-beautiful-mermaid",
    hooks: {
      "astro:config:setup": ({ updateConfig, config, injectScript }) => {
        const rehypePlugins = config.markdown?.rehypePlugins ?? [];
        updateConfig({
          markdown: {
            rehypePlugins: [...rehypePlugins, [rehypeBeautifulMermaid, options]]
          }
        });

        injectScript("page-ssr", buildCss(themeSelectors));
      }
    }
  };
};

export default beautifulMermaid;
