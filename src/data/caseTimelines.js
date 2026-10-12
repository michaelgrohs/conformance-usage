// Fabricated per-case event timelines for the "click a trace" detail panel.
// See overviewStats.js / CLAUDE.md — same rationale: deterministic, seeded,
// not real data.
import { VARIANT_IDS } from './variants.js'

function seededRandom(seed) {
  let s = seed % 233280
  if (s <= 0) s += 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildOffsets(count, totalDays, seed) {
  const rand = seededRandom(seed)
  const gaps = Array.from({ length: count - 1 }, () => 0.3 + rand())
  const gapSum = gaps.reduce((a, b) => a + b, 0)
  const totalHours = totalDays * 24
  const offsets = [0]
  let elapsed = 0
  for (const g of gaps) {
    elapsed += (g / gapSum) * totalHours
    offsets.push(Math.round(elapsed * 10) / 10)
  }
  return offsets
}

export function formatOffset(hours) {
  if (hours === 0) return 'Start'
  if (hours < 24) return `+${Math.round(hours)}h`
  const d = Math.floor(hours / 24)
  const h = Math.round(hours % 24)
  return h === 0 ? `+${d}d` : `+${d}d ${h}h`
}

// Total case duration (days) and a seed per variant, chosen to be roughly
// consistent with that variant's deviations being worse than the
// conforming baseline (4.2 days).
const CASE_DURATION_DAYS = {
  [VARIANT_IDS.DEVIATION_A]: 7.0,
  [VARIANT_IDS.DEVIATION_B]: 6.5,
  [VARIANT_IDS.CONFORMANT]: 4.0,
}

const SEEDS = {
  [VARIANT_IDS.DEVIATION_A]: 71,
  [VARIANT_IDS.DEVIATION_B]: 72,
  [VARIANT_IDS.CONFORMANT]: 73,
}

export function getCaseTimeline(variantId, trace) {
  const totalDays = CASE_DURATION_DAYS[variantId] ?? 5
  const offsets = buildOffsets(trace.length, totalDays, SEEDS[variantId] ?? 70)
  return {
    totalDays,
    events: trace.map((activity, i) => ({ activity, offsetHours: offsets[i] })),
  }
}
