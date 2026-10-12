const CHART_HEIGHT = 100

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const RATE_CHART_WIDTH = 440
const RATE_CHART_HEIGHT = 110
const RATE_CHART_LEFT_PAD = 30
const RATE_CHART_RIGHT_PAD = 6
const RATE_CHART_TOP_PAD = 6
const RATE_CHART_BOTTOM_PAD = 6
const RATE_GRID_LINES = [0, 50, 100]

// Daily conformance rate (%), as a line. Used in the shared overview (same
// content for all three groups — see CLAUDE.md).
export function ConformanceRateChart({ data }) {
  const plotW = RATE_CHART_WIDTH - RATE_CHART_LEFT_PAD - RATE_CHART_RIGHT_PAD
  const plotH = RATE_CHART_HEIGHT - RATE_CHART_TOP_PAD - RATE_CHART_BOTTOM_PAD
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const total = d.conforming + d.deviating
    const rate = total ? (d.conforming / total) * 100 : 0
    return {
      date: d.date,
      rate,
      x: RATE_CHART_LEFT_PAD + i * stepX,
      y: RATE_CHART_TOP_PAD + plotH - (rate / 100) * plotH,
    }
  })
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="history-chart">
      <svg
        className="rate-chart"
        viewBox={`0 0 ${RATE_CHART_WIDTH} ${RATE_CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Conformance rate over time"
      >
        {RATE_GRID_LINES.map((g) => {
          const y = RATE_CHART_TOP_PAD + plotH - (g / 100) * plotH
          return (
            <g key={g}>
              <line
                x1={RATE_CHART_LEFT_PAD}
                y1={y}
                x2={RATE_CHART_WIDTH - RATE_CHART_RIGHT_PAD}
                y2={y}
                className="rate-chart-gridline"
                vectorEffect="non-scaling-stroke"
              />
              <text x={RATE_CHART_LEFT_PAD - 5} y={y} className="rate-chart-axis-label" textAnchor="end" dominantBaseline="middle">
                {g}%
              </text>
            </g>
          )
        })}
        <polyline points={polylinePoints} className="rate-chart-line" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.4} className="rate-chart-dot">
            <title>{`${formatDate(p.date)} — ${Math.round(p.rate)}% conforming`}</title>
          </circle>
        ))}
      </svg>
      <div className="history-axis">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
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
