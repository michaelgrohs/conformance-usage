// Fabricated per-trace dataset backing the Overview dashboard and the
// global activity filter's AND/NOT narrowing (see CLAUDE.md "Data
// sourcing": entirely synthetic, generated deterministically via a seeded
// generator so it's stable across reloads/builds — not derived from the
// Qualtrics data or the paper's actual results).
//
// Each record is one notional trace: a date (bucketed into the same
// 21-day window the dashboard already showed), whether it conforms, a
// throughput time, and the SET of activities it contains. That activity
// set is what the filter's AND/NOT conditions are matched against (see
// filtering.js) — filtering actually narrows this collection down, it
// doesn't just highlight within it.

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

// Spreads `total` across `days` with mild day-to-day variation, summing
// exactly to `total`. Same approach as the rest of the fabricated data.
function distributeCount(total, days, rand) {
  const weights = Array.from({ length: days }, () => 0.4 + rand() * 1.2)
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

export const TOTAL_TRACES = 312
export const CONFORMING_TRACES = 198
export const DEVIATING_TRACES = TOTAL_TRACES - CONFORMING_TRACES // 114
export const CONFORMING_AVG_THROUGHPUT_DAYS = 4.2
export const CONFORMING_MEDIAN_THROUGHPUT_DAYS = 3.8

export const HISTORY_DATES = recentDates(HISTORY_DAYS)
const conformingDaily = distributeCount(CONFORMING_TRACES, HISTORY_DAYS, seededRandom(11))
const deviatingDaily = distributeCount(DEVIATING_TRACES, HISTORY_DAYS, seededRandom(22))

// Mandatory activities present in every trace. Ship Order is treated as
// effectively mandatory for *set membership* here — its >100% figure in
// activityStats (overviewStats.js) comes from occasional repeats within a
// trace, which don't matter for "does this trace contain Ship Order"
// filtering.
const MANDATORY_ACTIVITIES = ['Create Order', 'Approve Order', 'Clear Invoice', 'Archive Check', 'Ship Order']

// Per-trace probability of each optional activity occurring, matching the
// percentages in overviewStats.js's activityStats.
const ACTIVITY_PROBABILITY = {
  'Check Order': 0.901,
  'Assemble Products': 0.952,
  'Send Invoice': 0.952,
  'Order Materials': 0.429,
  'Request Materials': 0.099,
  'Adjust Materials': 0.083,
  'Send Reminder': 0.186,
  'Change Order': 0.141,
}

const activityRand = seededRandom(33)
function buildActivitySet() {
  const activities = new Set(MANDATORY_ACTIVITIES)
  for (const [activity, p] of Object.entries(ACTIVITY_PROBABILITY)) {
    if (activityRand() < p) activities.add(activity)
  }
  return activities
}

// Throughput jitter for conforming traces is zero-sum, so their average is
// exactly CONFORMING_AVG_THROUGHPUT_DAYS when the collection is unfiltered.
const throughputRand = seededRandom(44)
const conformingJitter = Array.from({ length: CONFORMING_TRACES - 1 }, () => (throughputRand() - 0.5) * 1.6)
conformingJitter.push(-conformingJitter.reduce((a, b) => a + b, 0))

const records = []
let conformingIndex = 0
let deviatingIndex = 0
for (let day = 0; day < HISTORY_DAYS; day++) {
  for (let i = 0; i < conformingDaily[day]; i++) {
    records.push({
      id: `c${conformingIndex}`,
      date: HISTORY_DATES[day],
      conforming: true,
      throughputDays: Math.round((CONFORMING_AVG_THROUGHPUT_DAYS + conformingJitter[conformingIndex]) * 10) / 10,
      activities: buildActivitySet(),
    })
    conformingIndex++
  }
  for (let i = 0; i < deviatingDaily[day]; i++) {
    records.push({
      id: `d${deviatingIndex}`,
      date: HISTORY_DATES[day],
      conforming: false,
      throughputDays: Math.round((CONFORMING_AVG_THROUGHPUT_DAYS + 1.3 + throughputRand() * 1.8) * 10) / 10,
      activities: buildActivitySet(),
    })
    deviatingIndex++
  }
}

export const traceCollection = records
