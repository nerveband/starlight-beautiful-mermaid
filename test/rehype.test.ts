import { describe, expect, it, vi, beforeEach } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeBeautifulMermaid from "../src/rehype-beautiful-mermaid";

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

const buildProcessor = (pluginOptions = {}) =>
  unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeBeautifulMermaid, pluginOptions)
    .use(rehypeStringify);

beforeEach(() => {
  renderMermaidMock.mockReset();
});

describe("rehype-beautiful-mermaid", () => {
  it("replaces mermaid code blocks with figure.bm-mermaid", async () => {
    renderMermaidMock.mockResolvedValueOnce("<svg>diagram</svg>");

    const markdown = "```mermaid\ngraph TD; A-->B;\n```";
    const result = String(await buildProcessor().process(markdown));

    expect(result).toContain('<figure class="bm-mermaid"><svg>diagram</svg></figure>');
    expect(result).not.toContain("language-mermaid");
  });

  it("applies per-diagram meta overrides including config JSON", async () => {
    renderMermaidMock.mockResolvedValueOnce("<svg>diagram</svg>");

    const markdown = `\`\`\`mermaid {theme="forest" spacing="2" config='{"theme":"base","spacing":3}'}
graph TD; A-->B;
\`\`\``;

    await buildProcessor().process(markdown);

    expect(renderMermaidMock).toHaveBeenCalledWith("graph TD; A-->B;\n", {
      theme: "base",
      spacing: 3
    });
  });

  it("leaves non-mermaid code blocks untouched", async () => {
    const markdown = "```js\nconsole.log('hi');\n```";
    const result = String(await buildProcessor().process(markdown));

    expect(result).toContain('<pre><code class="language-js">console.log(');
    expect(result).toContain("hi");
  });
});
