export type ThemeConfig = Record<string, unknown>;

export type ThemeEntry = {
  name: "light" | "dark";
  config: ThemeConfig;
};

export type PluginOptions = {
  autoTheming?: boolean;
  theme?: ThemeConfig;
  lightTheme?: ThemeConfig;
  darkTheme?: ThemeConfig;
};

export type MermaidOptions = Record<string, unknown>;
