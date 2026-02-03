import { describe, expect, it, vi } from "vitest";
import rehypeBeautifulMermaid from "../src/rehype-beautiful-mermaid";
import beautifulMermaid from "../src/index";

const buildContext = () => {
  const injectScript = vi.fn();
  const updatedConfig = { markdown: { rehypePlugins: [] as unknown[] } };
  const config = { markdown: { rehypePlugins: [] as unknown[] } };

  return { injectScript, updatedConfig, config };
};

const runSetup = async (options?: unknown) => {
  const integration = beautifulMermaid(options as never);
  const hook = integration.hooks["astro:config:setup"];
  const ctx = buildContext();

  await hook?.({
    config: ctx.config as never,
    updateConfig: (next) => {
      if (next.markdown?.rehypePlugins) {
        ctx.updatedConfig.markdown.rehypePlugins = next.markdown.rehypePlugins;
      }
    },
    injectScript: ctx.injectScript,
    command: "build",
    isRestart: false
  } as never);

  return ctx;
};

describe("beautifulMermaid integration", () => {
  it("registers rehype plugin and injects default selectors", async () => {
    const ctx = await runSetup();

    expect(ctx.updatedConfig.markdown.rehypePlugins).toHaveLength(1);
    const [pluginEntry] = ctx.updatedConfig.markdown.rehypePlugins as unknown[];
    expect(Array.isArray(pluginEntry)).toBe(true);
    expect(pluginEntry[0]).toBe(rehypeBeautifulMermaid);

    expect(ctx.injectScript).toHaveBeenCalled();
    const css = ctx.injectScript.mock.calls[0][1] as string;
    expect(css).toContain(":root[data-theme=\"light\"]");
    expect(css).toContain(":root[data-theme=\"dark\"]");
  });

  it("allows overriding selectors", async () => {
    const ctx = await runSetup({ themeSelectors: { light: ".light", dark: ".dark" } });

    const css = ctx.injectScript.mock.calls[0][1] as string;
    expect(css).toContain(".light");
    expect(css).toContain(".dark");
  });
});
