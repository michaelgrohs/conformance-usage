import { useMemo } from 'react'
import { computeFilteredOverview } from '../data/filtering.js'
import { ConformanceRateChart } from './HistoryChart.jsx'

const UNFILTERED_TOTAL = 312

// The aggregate dashboard shown first, identically to all three groups —
// see CLAUDE.md "Information architecture: Overview → Zoom → Filter →
// Details on demand". Trace counts and the conformance history are not
// deviation-type specific, so there's nothing here that's exclusive to
// event-level / pattern-level.
//
// `activityFilter` (the AND/NOT conditions from ActivityFilterBar) really
// narrows this dashboard's numbers down to the matching traces — it
// doesn't just highlight within the full set. See filtering.js.
export default function OverviewStats({ activityFilter = [] }) {
  const overview = useMemo(() => computeFilteredOverview(activityFilter), [activityFilter])
  const hasFilter = activityFilter.length > 0
  const { total, conformingCount, deviatingCount, avgThroughputDays, history } = overview

  const conformingPct = total ? Math.round((conformingCount / total) * 1000) / 10 : null
  const deviatingPct = total ? Math.round((deviatingCount / total) * 1000) / 10 : null

  return (
    <div className="panel overview-panel">
      <div className="panel-header">
        <h2>Overview — last 21 days</h2>
      </div>
      {hasFilter && (
        <p className="panel-hint overview-filter-note">
          Showing {total} of {UNFILTERED_TOTAL} traces matching the active filter.
        </p>
      )}
      {total === 0 ? (
        <p className="panel-empty">No traces match the active filter.</p>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-value">{total}</div>
              <div className="stat-label">Traces {hasFilter ? 'matching filter' : 'processed'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{conformingPct}%</div>
              <div className="stat-label">
                Conforming ({conformingCount} of {total})
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{deviatingPct}%</div>
              <div className="stat-label">
                Deviating ({deviatingCount} of {total})
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgThroughputDays != null ? `${avgThroughputDays}d` : '—'}</div>
              <div className="stat-label">Avg. throughput, conforming traces</div>
            </div>
          </div>
          <h3 className="subsection-title">Conformance history — % conforming per day</h3>
          <ConformanceRateChart data={history} />
        </>
      )}
    </div>
  )
}
