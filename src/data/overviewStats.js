// Fabricated-but-deterministic aggregate statistics for the
// deviation/activity detail panels. See CLAUDE.md "Data sourcing": none of
// this is real data — it exists to make the Details-on-Demand UI
// demonstrable with numbers that "appear realistic" (the user's own
// instruction). A small seeded generator is used instead of Math.random()
// or hand-typed arrays, so the numbers are stable across reloads/builds
// and easy to re-derive if the targets change.
//
// Unlike traceCollection.js, this file's stats (deviationStats,
// activityStats) are intentionally NOT filterable — the activity/deviation
// detail panels (DetailPanel.jsx) always show the same full-population
// numbers regardless of the active activity filter. See CLAUDE.md
// "Information architecture" for that scope decision.
import { CONFORMING_AVG_THROUGHPUT_DAYS, CONFORMING_MEDIAN_THROUGHPUT_DAYS } from './traceCollection.js'

export { CONFORMING_AVG_THROUGHPUT_DAYS, CONFORMING_MEDIAN_THROUGHPUT_DAYS }

const HISTORY_DAYS = 21

function seededRandom(seed) {
  let s = seed % 233280
  if (s <= 0) s += 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Spreads `total` across `days` with mild day-to-day variation and optional
// "spike" days (e.g. a one-off upstream system issue), summing exactly to
// `total`.
function distributeCount(total, days, seed, spikeDays = []) {
  const rand = seededRandom(seed)
  const weights = Array.from({ length: days }, (_, i) => {
    const base = 0.4 + rand() * 1.2
    return spikeDays.includes(i) ? base + 2.2 : base
  })
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

// Last HISTORY_DAYS calendar dates ending today, oldest first.
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

const dates = recentDates(HISTORY_DAYS)

// TOTAL_TRACES/CONFORMING_TRACES/DEVIATING_TRACES and the actual
// conformance history now live in traceCollection.js, which generates a
// real per-trace dataset so the Overview dashboard can be filtered (see
// filtering.js) rather than just displaying fixed totals. They're kept
// here, unexported, only as the baseline used below to percentage-ize
// deviationStats, which (like activityStats) intentionally stays
// unfiltered — see CLAUDE.md "Information architecture".
const TOTAL_TRACES = 312
const DEVIATING_TRACES = 114

// Per-deviation stats, keyed by the `deviationId` used in variants.js.
// occurrences can exceed DEVIATING_TRACES in total across deviations, since
// a single trace can exhibit more than one deviation — realistic for a
// process with several independent failure modes.
const deviationDefs = [
  { id: 'insert-change-order', label: 'Insert — ⟨Change Order, Change Order⟩', occurrences: 22, avgThroughput: 5.1, seed: 101, spikeDays: [] },
  { id: 'skip-assemble-send-invoice', label: 'Skip — ⟨Assemble Products, Send Invoice⟩', occurrences: 15, avgThroughput: 6.4, seed: 202, spikeDays: [] },
  { id: 'repeat-ship-order', label: 'Repeat — Ship Order', occurrences: 19, avgThroughput: 5.6, seed: 303, spikeDays: [] },
  { id: 'replace-check-order', label: 'Replace — Check Order → Request Materials', occurrences: 31, avgThroughput: 4.9, seed: 404, spikeDays: [8, 9] },
  { id: 'insert-adjust-materials', label: 'Insert — Adjust Materials', occurrences: 26, avgThroughput: 5.3, seed: 505, spikeDays: [] },
  { id: 'swap-ship-send-invoice', label: 'Swap — Ship Order / Send Invoice', occurrences: 34, avgThroughput: 6.0, seed: 606, spikeDays: [14] },
]

export const deviationStats = Object.fromEntries(
  deviationDefs.map((d) => {
    const daily = distributeCount(d.occurrences, HISTORY_DAYS, d.seed, d.spikeDays)
    return [
      d.id,
      {
        id: d.id,
        label: d.label,
        occurrences: d.occurrences,
        percentOfDeviating: Math.round((d.occurrences / DEVIATING_TRACES) * 1000) / 10,
        percentOfAll: Math.round((d.occurrences / TOTAL_TRACES) * 1000) / 10,
        avgThroughputDays: d.avgThroughput,
        throughputDeltaDays: Math.round((d.avgThroughput - CONFORMING_AVG_THROUGHPUT_DAYS) * 10) / 10,
        history: dates.map((date, i) => ({ date, count: daily[i] })),
      },
    ]
  }),
)

// Per-activity execution frequency, keyed by BPMN task name — used by the
// process-model click-to-detail panel. Shared identically across all three
// groups (not deviation-specific).
export const activityStats = {
  'Create Order': { executions: 312, percentOfTraces: 100 },
  'Check Order': { executions: 281, percentOfTraces: 90.1 },
  'Request Materials': { executions: 31, percentOfTraces: 9.9 },
  'Approve Order': { executions: 312, percentOfTraces: 100 },
  'Order Materials': { executions: 134, percentOfTraces: 42.9 },
  'Adjust Materials': { executions: 26, percentOfTraces: 8.3 },
  'Assemble Products': { executions: 297, percentOfTraces: 95.2 },
  'Send Invoice': { executions: 297, percentOfTraces: 95.2 },
  'Send Reminder': { executions: 58, percentOfTraces: 18.6 },
  'Ship Order': { executions: 331, percentOfTraces: 106.1 },
  'Clear Invoice': { executions: 312, percentOfTraces: 100 },
  'Archive Check': { executions: 312, percentOfTraces: 100 },
  'Change Order': { executions: 44, percentOfTraces: 14.1 },
}
