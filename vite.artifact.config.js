// A separate build config used only to produce a single, fully
// self-contained HTML file (all JS/CSS/fonts inlined, no external
// requests) for publishing as a hosted Artifact. Keeps the normal
// `npm run dev` / `npm run build` workflow (documented in the README)
// untouched — this is opt-in via `npm run build:artifact`.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-artifact',
    // Large enough that the bpmn-js icon font files (the biggest assets,
    // tens of KB) get base64-inlined as data URIs too, instead of being
    // left as separate files the single-file HTML can't reference.
    assetsInlineLimit: 300000,
    cssCodeSplit: false,
  },
})
