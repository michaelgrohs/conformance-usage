// Study configuration. See CLAUDE.md "Group assignment".

// SHA-256 hash (hex) of the password that unlocks the settings/admin panel.
// Never put the password itself here — this file ends up in the public
// JavaScript bundle. Set or change it with:
//
//   npm run set-admin-password -- "your password"
//
// which rewrites the line below. While it's empty, the admin panel can't be
// unlocked at all.
//
// Note: this is a client-side check on a static site. It keeps participants
// from switching groups by accident or curiosity; it is not real security.
export const ADMIN_PASSWORD_SHA256 = '34f97d7dbd3d25abf260a4e4e6e799dcc0d5e0ead8ec235332500aee42bcc2c1'

// Seed for the block randomization that maps participant numbers (?p=N in
// the link) to groups. Changing it reshuffles which participant number gets
// which group — only change it before data collection starts.
export const ASSIGNMENT_SEED = 20261124
