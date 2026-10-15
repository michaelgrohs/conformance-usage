import { variants } from '../data/variants.js'
import { activityStats, deviationStats, CONFORMING_AVG_THROUGHPUT_DAYS } from '../data/overviewStats.js'
import { getTraceTimeline, formatOffset } from '../data/traceTimelines.js'
import { SingleHistoryChart } from './HistoryChart.jsx'

function ActivityDetail({ activityName }) {
  const stats = activityStats[activityName]
  return (
    <>
      <h3 className="detail-title">{activityName}</h3>
      <p className="detail-kicker">Process-model activity</p>
      {stats ? (
        <div className="stat-cards stat-cards--detail">
          <div className="stat-card">
            <div className="stat-value">{stats.executions}</div>
            <div className="stat-label">Executions (last 21 days)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.percentOfTraces}%</div>
            <div className="stat-label">Of traces{stats.percentOfTraces > 100 ? ' (some repeat this step)' : ''}</div>
          </div>
        </div>
      ) : (
        <p className="panel-empty">No execution data available.</p>
      )}
    </>
  )
}

function TraceDetail({ variantId }) {
  const variant = variants[variantId]
  const { totalDays, events } = getTraceTimeline(variantId, variant.trace)
  return (
    <>
      <h3 className="detail-title">{variant.label}</h3>
      <p className="detail-kicker">Trace</p>
      <div className="stat-cards stat-cards--detail">
        <div className="stat-card">
          <div className="stat-value">{totalDays.toFixed(1)}d</div>
          <div className="stat-label">Trace throughput</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Events recorded</div>
        </div>
      </div>
      <table className="timeline-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Elapsed</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{e.activity}</td>
              <td>{formatOffset(e.offsetHours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function DeviationDetail({ deviationId }) {
  const stats = deviationStats[deviationId]
  if (!stats) return <p className="panel-empty">No data available for this deviation.</p>
  const worseBy = stats.throughputDeltaDays
  return (
    <>
      <h3 className="detail-title">{stats.label}</h3>
      <p className="detail-kicker">Deviation</p>
      <div className="stat-cards stat-cards--detail">
        <div className="stat-card">
          <div className="stat-value">{stats.occurrences}</div>
          <div className="stat-label">Occurrences (last 21 days)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.percentOfDeviating}%</div>
          <div className="stat-label">Of deviating traces</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.percentOfAll}%</div>
          <div className="stat-label">Of all traces</div>
        </div>
      </div>

      <h4 className="subsection-title">Deviation history</h4>
      <SingleHistoryChart data={stats.history} />

      <h4 className="subsection-title">Throughput time</h4>
      <div className="throughput-compare">
        <div className="throughput-row">
          <span className="throughput-label">Conforming traces</span>
          <div className="throughput-bar-track">
            <div
              className="throughput-bar throughput-bar--conforming"
              style={{ width: `${(CONFORMING_AVG_THROUGHPUT_DAYS / Math.max(stats.avgThroughputDays, CONFORMING_AVG_THROUGHPUT_DAYS)) * 100}%` }}
            />
          </div>
          <span className="throughput-value">{CONFORMING_AVG_THROUGHPUT_DAYS}d</span>
        </div>
        <div className="throughput-row">
          <span className="throughput-label">Traces with this deviation</span>
          <div className="throughput-bar-track">
            <div
              className="throughput-bar throughput-bar--deviating"
              style={{ width: `${(stats.avgThroughputDays / Math.max(stats.avgThroughputDays, CONFORMING_AVG_THROUGHPUT_DAYS)) * 100}%` }}
            />
          </div>
          <span className="throughput-value">{stats.avgThroughputDays}d</span>
        </div>
      </div>
      <p className="panel-hint">
        {worseBy > 0
          ? `Traces with this deviation take ${worseBy}d longer on average than conforming traces.`
          : `Traces with this deviation are not slower, on average, than conforming traces.`}
      </p>
    </>
  )
}

// The single "details on demand" destination for all three click targets
// (process-model activity, recorded trace, deviation). See CLAUDE.md
// "Information architecture".
export default function DetailPanel({ selection, onClose }) {
  if (!selection) return null
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {selection.type === 'activity' && <ActivityDetail activityName={selection.id} />}
        {selection.type === 'trace' && <TraceDetail variantId={selection.id} />}
        {selection.type === 'deviation' && <DeviationDetail deviationId={selection.id} />}
      </div>
    </div>
  )
}
