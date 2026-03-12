/** Color overrides matching beautiful-mermaid RenderOptions */
export type ColorOverrides = {
  bg?: string;
  fg?: string;
  line?: string;
  accent?: string;
  muted?: string;
  surface?: string;
  border?: string;
  font?: string;
  padding?: number;
  transparent?: boolean;
};

export type ThemeConfig = ColorOverrides & Record<string, unknown>;

export type ThemeEntry = {
  name: "light" | "dark";
  config: ThemeConfig;
};

export type PluginOptions = {
  /** Named theme (e.g. "github-dark", "tokyo-night") or color overrides object */
  theme?: string | ThemeConfig;
  /** Light theme overrides (used with autoTheming) */
  lightTheme?: string | ThemeConfig;
  /** Dark theme overrides (used with autoTheming) */
  darkTheme?: string | ThemeConfig;
  /** Render separate light/dark SVGs */
  autoTheming?: boolean;
  /** Throw on render errors instead of falling back to code block */
  failOnError?: boolean;
} & ColorOverrides;

export type MermaidOptions = Record<string, unknown>;

export type ThemeSelectors = {
  light: string;
  dark: string;
};

export type IntegrationOptions = PluginOptions & {
  themeSelectors?: Partial<ThemeSelectors>;
};
