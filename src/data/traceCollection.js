// Fabricated per-trace dataset ("the event log") backing the Overview
// dashboard, the activity/deviation detail panels, and the global activity
// filter's AND/NOT narrowing. See CLAUDE.md "Data sourcing": entirely
// synthetic, generated deterministically via a seeded generator so it's
// stable across reloads/builds — not derived from the Qualtrics data or the
// paper's actual results.
//
// The log consists of exactly the five explorable variants (variants.js):
// every record is one execution of one of them, and only how often each
// variant occurs is chosen here (VARIANT_FREQUENCIES). Everything else —
// conformance rate, activity frequencies, deviation frequencies/histories/
// throughput — is derived from these records (see overviewStats.js and
// filtering.js), so all numbers in the tool agree with each other and with
// the variants a user can actually select.
import { VARIANT_IDS, variantList } from './variants.js'

const HISTORY_DAYS = 21

function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 48271) % 2147483647
    return (s - 1) / 2147483646
  }
}

function recentDates(days) {
  const dates = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

// Spreads `total` across `days` with mild day-to-day variation (plus
// optional "spike" days), summing exactly to `total`.
function distributeCount(total, days, rand, spikeDays = []) {
  const weights = Array.from({ length: days }, (_, i) => 0.4 + rand() * 1.2 + (spikeDays.includes(i) ? 2.2 : 0))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const counts = weights.map((w) => Math.round((w / weightSum) * total))
  let diff = total - counts.reduce((a, b) => a + b, 0)
  let i = 0
  while (diff !== 0) {
    const idx = i % days
    if (diff > 0) {
      counts[idx]++
      diff--
    } else if (counts[idx] > 0) {
      counts[idx]--
      diff++
    }
    i++
  }
  return counts
}

// How often each variant occurs in the log, and the average throughput
// (days) of its executions. The only hand-chosen numbers in the log.
// Throughput means sit near each variant's concrete timeline in
// traceTimelines.js.
const VARIANT_FREQUENCIES = {
  [VARIANT_IDS.CONFORMANT]: { count: 198, avgThroughputDays: 4.2, seed: 11, spikeDays: [] },
  [VARIANT_IDS.DEVIATION_A]: { count: 34, avgThroughputDays: 6.8, seed: 22, spikeDays: [] },
  [VARIANT_IDS.DEVIATION_B]: { count: 38, avgThroughputDays: 6.3, seed: 33, spikeDays: [8, 9] },
  [VARIANT_IDS.DEVIATION_C]: { count: 36, avgThroughputDays: 5.1, seed: 44, spikeDays: [] },
  [VARIANT_IDS.DEVIATION_D]: { count: 6, avgThroughputDays: 9.4, seed: 55, spikeDays: [] },
}

export const HISTORY_DATES = recentDates(HISTORY_DAYS)
export const TOTAL_TRACES = Object.values(VARIANT_FREQUENCIES).reduce((sum, f) => sum + f.count, 0) // 312
export const CONFORMING_AVG_THROUGHPUT_DAYS = VARIANT_FREQUENCIES[VARIANT_IDS.CONFORMANT].avgThroughputDays

// Zero-sum jitter, so each variant's unfiltered average throughput is
// exactly its avgThroughputDays (up to rounding).
function throughputs(count, mean, rand) {
  const jitter = Array.from({ length: count - 1 }, () => (rand() - 0.5) * 1.6)
  jitter.push(-jitter.reduce((a, b) => a + b, 0))
  return jitter.map((j) => Math.round((mean + j) * 10) / 10)
}

const records = []
for (const variant of variantList) {
  const freq = VARIANT_FREQUENCIES[variant.id]
  if (!freq) continue
  const rand = seededRandom(freq.seed)
  const daily = distributeCount(freq.count, HISTORY_DAYS, rand, freq.spikeDays)
  const times = throughputs(freq.count, freq.avgThroughputDays, rand)
  const activities = new Set(variant.trace)
  let n = 0
  daily.forEach((countOnDay, day) => {
    for (let i = 0; i < countOnDay; i++) {
      records.push({
        id: `${variant.id}-${n}`,
        variantId: variant.id,
        date: HISTORY_DATES[day],
        conforming: variant.conforming,
        throughputDays: times[n],
        trace: variant.trace,
        activities,
      })
      n++
    }
  })
}

export const traceCollection = records
