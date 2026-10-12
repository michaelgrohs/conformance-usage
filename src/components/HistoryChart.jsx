const CHART_HEIGHT = 100

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Daily conforming/deviating case counts, stacked. Used in the shared
// overview (same content for all three groups — see CLAUDE.md).
export function StackedHistoryChart({ data }) {
  const max = Math.max(...data.map((d) => d.conforming + d.deviating), 1)
  return (
    <div className="history-chart">
      <div className="history-bars" style={{ height: CHART_HEIGHT }}>
        {data.map((d) => {
          const total = d.conforming + d.deviating
          const totalPx = (total / max) * CHART_HEIGHT
          const devPx = total ? (d.deviating / total) * totalPx : 0
          const confPx = totalPx - devPx
          return (
            <div
              className="history-bar-col"
              key={d.date}
              title={`${formatDate(d.date)} — ${d.conforming} conforming, ${d.deviating} deviating`}
            >
              <div className="history-bar-seg history-bar-seg--conforming" style={{ height: confPx }} />
              <div className="history-bar-seg history-bar-seg--deviating" style={{ height: devPx }} />
            </div>
          )
        })}
      </div>
      <div className="history-axis">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
      <div className="history-legend">
        <span className="history-legend-item">
          <i className="swatch swatch--conforming" /> Conforming
        </span>
        <span className="history-legend-item">
          <i className="swatch swatch--deviating" /> Deviating
        </span>
      </div>
    </div>
  )
}

// Daily occurrence count for one specific deviation. Used in the deviation
// detail panel (event-level / pattern-level only).
export function SingleHistoryChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="history-chart">
      <div className="history-bars" style={{ height: CHART_HEIGHT }}>
        {data.map((d) => (
          <div
            className="history-bar-col"
            key={d.date}
            title={`${formatDate(d.date)} — ${d.count} occurrence${d.count === 1 ? '' : 's'}`}
          >
            <div className="history-bar-seg history-bar-seg--deviating" style={{ height: (d.count / max) * CHART_HEIGHT }} />
          </div>
        ))}
      </div>
      <div className="history-axis">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  )
}
