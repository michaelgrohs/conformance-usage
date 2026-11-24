// Aggregate statistics for the activity/deviation detail panels, derived
// from the fabricated event log in traceCollection.js (see CLAUDE.md "Data
// sourcing": none of this is real data). Nothing here is hand-typed: the
// log consists of exactly the five explorable variants, so each deviation's
// frequency/history/throughput is that of the traces of the variant it
// occurs in, and each activity's frequency follows from which variants
// contain it.
//
// These stats are intentionally NOT filterable — the activity/deviation
// detail panels (DetailPanel.jsx) always show the same full-population
// numbers regardless of the active activity filter. See CLAUDE.md
// "Information architecture" for that scope decision.
import { traceCollection, HISTORY_DATES, TOTAL_TRACES, CONFORMING_AVG_THROUGHPUT_DAYS } from './traceCollection.js'
import { variantList } from './variants.js'

export { CONFORMING_AVG_THROUGHPUT_DAYS }

const round1 = (x) => Math.round(x * 10) / 10
const pct = (part, whole) => round1((part / whole) * 100)

const DEVIATING_TRACES = traceCollection.filter((t) => !t.conforming).length

// Display labels per deviation, keyed by the `deviationId`s in variants.js.
const DEVIATION_LABELS = {
  'insert-change-order': 'Insert — ⟨Change Order, Change Order⟩',
  'skip-assemble-send-invoice': 'Skip — ⟨Assemble Products, Send Invoice⟩',
  'repeat-ship-order': 'Repeat — Ship Order',
  'replace-check-order': 'Replace — Check Order → Request Materials',
  'insert-adjust-materials': 'Insert — Adjust Materials',
  'swap-ship-send-invoice': 'Swap — Ship Order / Send Invoice',
  'insert-change-order-single': 'Insert — Change Order',
  'repeat-check-order': 'Repeat — Check Order',
  'insert-request-materials': 'Insert — Request Materials',
  'skip-approve-order': 'Skip — Approve Order',
  'skip-clear-invoice': 'Skip — Clear Invoice',
}

// Per-deviation stats. A deviation occurs in exactly the traces of the
// variant(s) whose pattern-level list contains it.
export const deviationStats = Object.fromEntries(
  Object.entries(DEVIATION_LABELS).map(([id, label]) => {
    const variantIds = new Set(variantList.filter((v) => v.patternLevelDeviations.some((d) => d.id === id)).map((v) => v.id))
    const traces = traceCollection.filter((t) => variantIds.has(t.variantId))
    const occurrences = traces.length
    const avgThroughputDays = occurrences ? round1(traces.reduce((s, t) => s + t.throughputDays, 0) / occurrences) : 0
    return [
      id,
      {
        id,
        label,
        occurrences,
        percentOfDeviating: pct(occurrences, DEVIATING_TRACES),
        percentOfAll: pct(occurrences, TOTAL_TRACES),
        avgThroughputDays,
        throughputDeltaDays: round1(avgThroughputDays - CONFORMING_AVG_THROUGHPUT_DAYS),
        history: HISTORY_DATES.map((date) => ({ date, count: traces.filter((t) => t.date === date).length })),
      },
    ]
  }),
)

// Per-activity execution frequency, keyed by BPMN task name — used by the
// activity click-to-detail panel (shared identically across all three
// groups). Key order is also the activity filter's dropdown order.
// executions = total occurrences incl. repeats within a trace;
// tracesWithActivity / percentOfTraces = traces containing it at least once.
const ACTIVITY_ORDER = [
  'Create Order',
  'Check Order',
  'Request Materials',
  'Approve Order',
  'Order Materials',
  'Adjust Materials',
  'Assemble Products',
  'Send Invoice',
  'Send Reminder',
  'Ship Order',
  'Clear Invoice',
  'Archive Check',
  'Change Order',
]

export const activityStats = Object.fromEntries(
  ACTIVITY_ORDER.map((activity) => {
    let executions = 0
    let tracesWithActivity = 0
    for (const t of traceCollection) {
      const n = t.trace.filter((a) => a === activity).length
      executions += n
      if (n > 0) tracesWithActivity++
    }
    return [activity, { executions, tracesWithActivity, percentOfTraces: pct(tracesWithActivity, TOTAL_TRACES) }]
  }),
)
