import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBeautifulMermaid from "starlight-beautiful-mermaid";

export default defineConfig({
  integrations: [
    starlight({
      integrations: [
        starlightBeautifulMermaid({
          autoTheming: true,
          theme: { theme: "neutral" },
          lightTheme: { theme: "default" },
          darkTheme: { theme: "dark" }
        })
      ]
    })
  ]
});
