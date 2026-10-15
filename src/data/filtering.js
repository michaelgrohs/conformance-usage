import { traceCollection, HISTORY_DATES } from './traceCollection.js'
import { variantList } from './variants.js'

// Shared activity-filter matching logic — AND across all active
// conditions, each condition independently either "must include" or "must
// exclude" (NOT). A trace/variant is excluded from every filtered result
// the moment it fails one condition; this is real narrowing, not a
// highlight-only overlay (see CLAUDE.md "Information architecture" /
// "Filter"). Used identically against the fabricated 312-trace collection
// (for the Overview dashboard) and the 3 explorable trace variants (for
// the trace selector) — same conditions, same semantics, in both places.
export function matchesConditions(activitySet, conditions) {
  return conditions.every((c) => (c.mode === 'exclude' ? !activitySet.has(c.activity) : activitySet.has(c.activity)))
}

// Recomputes the Overview dashboard's numbers (total/conforming/deviating
// counts, average throughput, conformance history) against only the
// traces that satisfy `conditions`. Returns null fields where nothing
// matches, rather than NaN/0, so the UI can show "no data" explicitly.
export function computeFilteredOverview(conditions) {
  const matched = conditions.length ? traceCollection.filter((t) => matchesConditions(t.activities, conditions)) : traceCollection
  const conforming = matched.filter((t) => t.conforming)
  const total = matched.length
  const conformingCount = conforming.length
  const deviatingCount = total - conformingCount
  const avgThroughputDays = conforming.length
    ? Math.round((conforming.reduce((sum, t) => sum + t.throughputDays, 0) / conforming.length) * 10) / 10
    : null

  const byDate = new Map(HISTORY_DATES.map((d) => [d, { conforming: 0, deviating: 0 }]))
  for (const t of matched) {
    const bucket = byDate.get(t.date)
    if (t.conforming) bucket.conforming++
    else bucket.deviating++
  }
  const history = HISTORY_DATES.map((date) => ({ date, ...byDate.get(date) }))

  return { total, conformingCount, deviatingCount, avgThroughputDays, history }
}

// The explorable trace variants (Variant 1/2/3) that satisfy `conditions`,
// matched against each variant's own set of activities (deduped from its
// recorded trace).
export function matchingVariants(conditions) {
  if (!conditions.length) return variantList
  return variantList.filter((v) => matchesConditions(new Set(v.trace), conditions))
}
