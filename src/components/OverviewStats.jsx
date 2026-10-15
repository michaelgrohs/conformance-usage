import {
  TOTAL_TRACES,
  CONFORMING_TRACES,
  DEVIATING_TRACES,
  CONFORMING_AVG_THROUGHPUT_DAYS,
  conformanceHistory,
} from '../data/overviewStats.js'
import { ConformanceRateChart } from './HistoryChart.jsx'

const conformingPct = Math.round((CONFORMING_TRACES / TOTAL_TRACES) * 1000) / 10
const deviatingPct = Math.round((DEVIATING_TRACES / TOTAL_TRACES) * 1000) / 10

// The aggregate dashboard shown first, identically to all three groups —
// see CLAUDE.md "Information architecture: Overview → Zoom → Details on
// demand". Trace counts and the conformance history are not deviation-type
// specific, so there's nothing here that's exclusive to event-level /
// pattern-level.
export default function OverviewStats() {
  return (
    <div className="panel overview-panel">
      <div className="panel-header">
        <h2>Overview — last 21 days</h2>
      </div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{TOTAL_TRACES}</div>
          <div className="stat-label">Traces processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{conformingPct}%</div>
          <div className="stat-label">
            Conforming ({CONFORMING_TRACES} of {TOTAL_TRACES})
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{deviatingPct}%</div>
          <div className="stat-label">
            Deviating ({DEVIATING_TRACES} of {TOTAL_TRACES})
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{CONFORMING_AVG_THROUGHPUT_DAYS}d</div>
          <div className="stat-label">Avg. throughput, conforming traces</div>
        </div>
      </div>
      <h3 className="subsection-title">Conformance history — % conforming per day</h3>
      <ConformanceRateChart data={conformanceHistory} />
    </div>
  )
}
