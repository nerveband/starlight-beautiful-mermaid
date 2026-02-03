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
    const script = ctx.injectScript.mock.calls[0][1] as string;
    expect(script).toContain("import \"starlight-beautiful-mermaid/styles.css\";");
  });

  it("allows overriding selectors", async () => {
    const ctx = await runSetup({ themeSelectors: { light: ".light", dark: ".dark" } });

    const script = ctx.injectScript.mock.calls[0][1] as string;
    expect(script).toContain("import \"starlight-beautiful-mermaid/styles.css\";");
    const overrideCss = `.light .bm-mermaid .mermaid-themes [data-theme=\"light\"],\n.dark .bm-mermaid .mermaid-themes [data-theme=\"dark\"] {\n  display: block;\n}`;
    const encoded = encodeURIComponent(overrideCss);
    expect(script).toContain(`import \"data:text/css,${encoded}\";`);
  });
});
