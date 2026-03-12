import { renderMermaid, THEMES } from "beautiful-mermaid";
import type { MermaidOptions, PluginOptions, ThemeConfig, ThemeEntry } from "./types";

/** Resolve a string theme name to its colors, or return the object as-is */
const resolveTheme = (theme: string | ThemeConfig | undefined): ThemeConfig => {
  if (!theme) return {};
  if (typeof theme === "string") {
    const colors = (THEMES as Record<string, Record<string, string>>)[theme];
    return colors ? { ...colors } : {};
  }
  return theme;
};

/** Extract top-level color overrides from plugin options */
const extractColorOverrides = (options: PluginOptions): ThemeConfig => {
  const keys = ["bg", "fg", "line", "accent", "muted", "surface", "border", "font", "padding", "transparent"];
  const overrides: ThemeConfig = {};
  for (const key of keys) {
    if ((options as Record<string, unknown>)[key] !== undefined) {
      overrides[key] = (options as Record<string, unknown>)[key];
    }
  }
  return overrides;
};

const mergeConfigs = (...configs: Array<ThemeConfig | undefined>) => {
  return Object.assign({}, ...configs.filter(Boolean));
};

export const resolveThemeConfigs = (
  defaults: ThemeConfig,
  pluginOptions: PluginOptions = {},
  meta: ThemeConfig = {}
): ThemeEntry[] => {
  const baseTheme = resolveTheme(pluginOptions.theme);
  const colorOverrides = extractColorOverrides(pluginOptions);
  const base = mergeConfigs(defaults, baseTheme, colorOverrides);

  if (pluginOptions.autoTheming) {
    const lightTheme = resolveTheme(pluginOptions.lightTheme);
    const darkTheme = resolveTheme(pluginOptions.darkTheme);
    return [
      {
        name: "light",
        config: mergeConfigs(base, lightTheme, meta)
      },
      {
        name: "dark",
        config: mergeConfigs(base, darkTheme, meta)
      }
    ];
  }

  return [
    {
      name: "light",
      config: mergeConfigs(base, meta)
    }
  ];
};

export const renderSvgForTheme = async (
  code: string,
  themeConfig: ThemeConfig,
  mermaidOptions: MermaidOptions = {}
): Promise<string> => {
  const config = mergeConfigs(mermaidOptions, themeConfig);
  return renderMermaid(code, config);
};

export const wrapThemedSvgs = (lightSvg: string, darkSvg: string): string => {
  return `<span class="mermaid-themes"><span data-theme="light">${lightSvg}</span><span data-theme="dark">${darkSvg}</span></span>`;
};
