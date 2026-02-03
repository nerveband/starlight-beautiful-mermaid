import type { AstroIntegration } from "astro";
import rehypeBeautifulMermaid from "./rehype-beautiful-mermaid";
import type { IntegrationOptions, ThemeSelectors } from "./types";

const DEFAULT_THEME_SELECTORS: ThemeSelectors = {
  light: ":root[data-theme=\"light\"]",
  dark: ":root[data-theme=\"dark\"]"
};

const buildOverrideCss = (selectors: ThemeSelectors) => {
  return `${selectors.light} .bm-mermaid .mermaid-themes [data-theme="light"],\n` +
    `${selectors.dark} .bm-mermaid .mermaid-themes [data-theme="dark"] {\n` +
    "  display: block;\n" +
    "}";
};

const buildInjectScript = (selectors: ThemeSelectors) => {
  const baseImport = 'import "starlight-beautiful-mermaid/styles.css";';
  const hasOverrides =
    selectors.light !== DEFAULT_THEME_SELECTORS.light ||
    selectors.dark !== DEFAULT_THEME_SELECTORS.dark;

  if (!hasOverrides) {
    return baseImport;
  }

  const overrideCss = buildOverrideCss(selectors);
  const encoded = encodeURIComponent(overrideCss);
  return `${baseImport}\nimport "data:text/css,${encoded}";`;
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

        injectScript("page-ssr", buildInjectScript(themeSelectors));
      }
    }
  };
};

export default beautifulMermaid;
