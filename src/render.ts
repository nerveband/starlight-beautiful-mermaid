import { renderMermaid } from "beautiful-mermaid";
import type { MermaidOptions, PluginOptions, ThemeConfig, ThemeEntry } from "./types";

const mergeConfigs = (...configs: Array<ThemeConfig | undefined>) => {
  return Object.assign({}, ...configs.filter(Boolean));
};

export const resolveThemeConfigs = (
  defaults: ThemeConfig,
  pluginOptions: PluginOptions = {},
  meta: ThemeConfig = {}
): ThemeEntry[] => {
  const base = mergeConfigs(defaults, pluginOptions.theme);

  if (pluginOptions.autoTheming) {
    return [
      {
        name: "light",
        config: mergeConfigs(base, pluginOptions.lightTheme, meta)
      },
      {
        name: "dark",
        config: mergeConfigs(base, pluginOptions.darkTheme, meta)
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
  return `<span class=\"mermaid-themes\"><span data-theme=\"light\">${lightSvg}</span><span data-theme=\"dark\">${darkSvg}</span></span>`;
};
