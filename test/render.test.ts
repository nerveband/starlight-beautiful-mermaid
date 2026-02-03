import { describe, expect, it, vi } from "vitest";
import { resolveThemeConfigs, renderSvgForTheme, wrapThemedSvgs } from "../src/render";

vi.mock(
  "beautiful-mermaid",
  () => ({
    renderMermaid: vi.fn()
  }),
  { virtual: true }
);

const { renderMermaid } = await import("beautiful-mermaid");

// @ts-expect-error - vitest mock type
const renderMermaidMock = renderMermaid as ReturnType<typeof vi.fn>;

describe("resolveThemeConfigs", () => {
  it("merges defaults, plugin options, then per-diagram meta", () => {
    const defaults = { theme: "base", padding: 1 };
    const pluginOptions = { autoTheming: false, theme: { padding: 2 } };
    const meta = { padding: 3 };

    const [resolved] = resolveThemeConfigs(defaults, pluginOptions, meta);

    expect(resolved.name).toBe("light");
    expect(resolved.config).toEqual({ theme: "base", padding: 3 });
  });

  it("returns light and dark configs when autoTheming is enabled", () => {
    const defaults = { theme: "base" };
    const pluginOptions = {
      autoTheming: true,
      theme: { spacing: 1 },
      lightTheme: { theme: "light" },
      darkTheme: { theme: "dark" }
    };
    const meta = { spacing: 2 };

    const resolved = resolveThemeConfigs(defaults, pluginOptions, meta);

    expect(resolved).toEqual([
      { name: "light", config: { theme: "light", spacing: 2 } },
      { name: "dark", config: { theme: "dark", spacing: 2 } }
    ]);
  });
});

describe("renderSvgForTheme", () => {
  it("renders a diagram with theme config merged into mermaid options", async () => {
    renderMermaidMock.mockResolvedValueOnce("<svg>diagram</svg>");

    const svg = await renderSvgForTheme(
      "graph TD; A-->B;",
      { theme: "dark", spacing: 2 },
      { securityLevel: "loose" }
    );

    expect(renderMermaidMock).toHaveBeenCalledWith("graph TD; A-->B;", {
      securityLevel: "loose",
      theme: "dark",
      spacing: 2
    });
    expect(svg).toBe("<svg>diagram</svg>");
  });
});

describe("wrapThemedSvgs", () => {
  it("wraps light and dark SVGs with data-theme attributes", () => {
    const result = wrapThemedSvgs("<svg>light</svg>", "<svg>dark</svg>");

    expect(result).toBe(
      "<span class=\"mermaid-themes\"><span data-theme=\"light\"><svg>light</svg></span><span data-theme=\"dark\"><svg>dark</svg></span></span>"
    );
  });
});
