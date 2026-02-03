import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import type { Root, Element, Text } from "hast";
import { resolveThemeConfigs, renderSvgForTheme, wrapThemedSvgs } from "./render";
import type { PluginOptions, ThemeConfig } from "./types";

const META_PAIR_RE = /([A-Za-z0-9_-]+)\s*=\s*"([^"]*)"/g;
const CONFIG_RE = /config\s*=\s*'([^']+)'|config\s*=\s*"([^"]+)"/;

const parseMeta = (meta = ""): ThemeConfig => {
  const pairs: ThemeConfig = {};

  for (const match of meta.matchAll(META_PAIR_RE)) {
    const [, key, value] = match;
    pairs[key] = value;
  }

  const configMatch = meta.match(CONFIG_RE);
  if (configMatch) {
    const raw = configMatch[1] ?? configMatch[2];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ThemeConfig;
        return { ...pairs, ...parsed };
      } catch {
        return pairs;
      }
    }
  }

  return pairs;
};

const DEFAULT_THEME: ThemeConfig = {};

const rehypeBeautifulMermaid = (options: PluginOptions = {}) => {
  return async (tree: Root) => {
    const tasks: Array<Promise<void>> = [];

    visit(tree, "element", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName !== "pre") return;

      const code = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "code"
      );

      if (!code) return;

      const className = Array.isArray(code.properties?.className)
        ? (code.properties?.className as string[])
        : typeof code.properties?.className === "string"
          ? [code.properties.className]
          : [];

      if (!className.includes("language-mermaid")) return;

      const meta =
        typeof code.data?.meta === "string"
          ? code.data.meta
          : typeof code.properties?.meta === "string"
            ? code.properties.meta
            : "";

      const diagram = code.children
        .filter((child): child is Text => child.type === "text")
        .map((child) => child.value)
        .join("");

      const themeConfig = parseMeta(meta);
      const themeEntries = resolveThemeConfigs(DEFAULT_THEME, options, themeConfig);

      const task = (async () => {
        try {
          if (options.autoTheming) {
            const [light, dark] = themeEntries;
            const lightSvg = await renderSvgForTheme(diagram, light.config);
            const darkSvg = await renderSvgForTheme(diagram, dark.config);
            const html = `<figure class="bm-mermaid">${wrapThemedSvgs(lightSvg, darkSvg)}</figure>`;
            const replacement = fromHtml(html, { fragment: true }).children[0] as Element;
            parent.children[index] = replacement;
          } else {
            const [entry] = themeEntries;
            const svg = await renderSvgForTheme(diagram, entry.config);
            const html = `<figure class="bm-mermaid">${svg}</figure>`;
            const replacement = fromHtml(html, { fragment: true }).children[0] as Element;
            parent.children[index] = replacement;
          }
        } catch (error) {
          if (options.failOnError) throw error;
          const fallback = fromHtml(
            '<pre><code class="language-mermaid"></code></pre>',
            { fragment: true }
          ).children[0] as Element;
          const fallbackCode = fallback.children[0] as Element;
          fallbackCode.children = [{ type: "text", value: diagram } as Text];
          parent.children[index] = fallback;
        }
      })();

      tasks.push(task);
    });

    if (tasks.length) {
      await Promise.all(tasks);
    }
  };
};

export default rehypeBeautifulMermaid;
