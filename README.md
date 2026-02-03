# starlight-beautiful-mermaid

Astro integration for rendering Mermaid diagrams at build time with automatic light/dark theming.

## Install

```bash
npm install starlight-beautiful-mermaid
```

## Usage

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import beautifulMermaid from "starlight-beautiful-mermaid";

export default defineConfig({
  integrations: [
    starlight(),
    beautifulMermaid()
  ]
});
```

## Configuration

```ts
beautifulMermaid({
  // Enables build-time light/dark rendering.
  autoTheming: true,
  // Theme selectors used to show light/dark SVGs.
  themeSelectors: {
    light: "html[data-theme='light']",
    dark: "html[data-theme='dark']"
  }
});
```

### Per-diagram overrides

Add JSON-like attributes to the Mermaid code fence:

```md
~~~mermaid {theme: "forest"}
graph TD;
  A-->B;
~~~
```

These overrides are merged with global options for the diagram.

## Development

```bash
npm run build
npm test
```
