// Sets the password for the tool's settings/admin panel.
//
//   npm run set-admin-password -- "your password"
//
// Only the SHA-256 hash is written (into src/config.js), never the password
// itself, because config.js is bundled into the public site.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run set-admin-password -- "your password"')
  process.exit(1)
}
const configPath = fileURLToPath(new URL('../src/config.js', import.meta.url))
const hash = createHash('sha256').update(password, 'utf8').digest('hex')
const src = readFileSync(configPath, 'utf8')
const pattern = /export const ADMIN_PASSWORD_SHA256 = '[0-9a-f]*'/
if (!pattern.test(src)) {
  console.error('Could not find the ADMIN_PASSWORD_SHA256 line in src/config.js')
  process.exit(1)
}
writeFileSync(configPath, src.replace(pattern, `export const ADMIN_PASSWORD_SHA256 = '${hash}'`))
console.log('Admin password updated in src/config.js (hash only). Rebuild/push for it to take effect.')
