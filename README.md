# Conformance Checking Explorer

A small static tool for exploring the order-to-cash conformance-checking
material from the EJIS experiment (see `../CLAUDE.md` for background, goals,
and guidelines). On load, you're randomly assigned to one of three
representation groups (trace-only / event-level / pattern-level) and shown
the order-to-cash process model, the recorded trace, and the corresponding
conformance-checking results for your group.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Overriding the group

Use the "⚙ Admin" control in the bottom-right corner to force a specific
group or reset to a fresh random assignment.

## Hosted version

A self-contained build is published as a Claude Artifact:
https://claude.ai/artifact/M2UhthkrxEK5HL2caU98vk

It's **private by default** — only reachable by the account that published
it until that account shares it (via the page's own Share menu). It's not a
live deployment that tracks this repo; it's a snapshot that needs
re-publishing after changes (see below).

### How it's built

```bash
npm run build:artifact
```

Produces `dist-artifact/artifact.html` — one HTML file with all JS/CSS/fonts
inlined (via `vite-plugin-singlefile` + a high `assetsInlineLimit`, configured
in `vite.artifact.config.js`), so it has zero external requests at runtime.
The command runs two steps: `vite build` (full single-file bundle, still a
complete `<!doctype>/<html>/<head>/<body>` document — that's
`dist-artifact/index.html`), then
`scripts/extract-artifact-content.mjs`, which strips that down to just
`<title>` + `<style>` + `<script type="module">` + the body's inner content
— the format the Artifact publish tool expects (it wraps content in its own
document skeleton, so the raw Vite output can't be published as-is).

To republish after changes: run `npm run build:artifact`, then publish
`dist-artifact/artifact.html` with the Artifact tool, passing the existing
artifact's URL so it updates in place rather than creating a new one.
