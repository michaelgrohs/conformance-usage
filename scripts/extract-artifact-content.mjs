// Turns the single-file Vite build (dist-artifact/index.html — a full
// <!doctype>/<html>/<head>/<body> document, everything inlined by
// vite-plugin-singlefile) into the content format the Artifact publish tool
// expects: just <title>, <style>, <script type="module">, and the body's
// inner content, no outer document tags (the Artifact platform wraps those
// itself). Run after `vite build --config vite.artifact.config.js`; see
// package.json's `build:artifact` script, which runs both in sequence.
import { readFileSync, writeFileSync } from 'node:fs'

const inPath = 'dist-artifact/index.html'
const outPath = 'dist-artifact/artifact.html'

const content = readFileSync(inPath, 'utf-8')

const titleMatch = content.match(/<title>.*?<\/title>/s)
const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)
const scriptMatch = content.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>\s*<style/)
const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/)

for (const [name, m] of [
  ['<title>', titleMatch],
  ['<style>', styleMatch],
  ['<script type="module"> (immediately followed by <style>)', scriptMatch],
  ['<body>', bodyMatch],
]) {
  if (!m) {
    console.error(`extract-artifact-content: couldn't find ${name} in ${inPath}. The Vite output structure may have changed — check the regex above.`)
    process.exit(1)
  }
}

const out = `${titleMatch[0]}
<style>
${styleMatch[1]}
</style>
<script type="module">
${scriptMatch[1]}
</script>
${bodyMatch[1].trim()}
`

writeFileSync(outPath, out, 'utf-8')
console.log(`Wrote ${outPath} (${out.length} bytes, content-only — ready to publish with the Artifact tool).`)
