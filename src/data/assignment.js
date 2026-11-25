import { GROUPS } from './variants.js'
import { ASSIGNMENT_SEED } from '../config.js'

// Group assignment logic (see CLAUDE.md "Group assignment").
//
// Participants get a personal link with their participant number, e.g.
// .../conformance-usage/?p=7. Numbers are mapped to groups by block
// randomization: consecutive numbers form blocks of three (1–3, 4–6, ...),
// and each block contains every group exactly once, in a seeded random
// order. So for any participants 1..N, group sizes differ by at most 1 —
// as long as numbers are handed out in order without gaps. The mapping is
// deterministic (same number → same group, on any device), so it needs no
// server.

export const ALL_GROUPS = [GROUPS.TRACE_ONLY, GROUPS.EVENT_LEVEL, GROUPS.PATTERN_LEVEL]

// mulberry32 — small seeded PRNG
function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function blockOrder(blockIndex) {
  const rand = seeded(ASSIGNMENT_SEED * 1000003 + blockIndex)
  const order = [...ALL_GROUPS]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// Participant numbers start at 1.
export function groupForParticipant(n) {
  const index = n - 1
  return blockOrder(Math.floor(index / ALL_GROUPS.length))[index % ALL_GROUPS.length]
}

// Reads ?p=N from a query string; returns a positive integer or null.
export function parseParticipantNumber(search) {
  const raw = new URLSearchParams(search).get('p')
  if (raw == null || !/^\d+$/.test(raw.trim())) return null
  const n = Number(raw.trim())
  return n >= 1 && Number.isSafeInteger(n) ? n : null
}

export function randomGroup() {
  return ALL_GROUPS[Math.floor(Math.random() * ALL_GROUPS.length)]
}

export function participantLink(n) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}?p=${n}`
}

// SHA-256 hex digest via Web Crypto (available on https and localhost).
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
