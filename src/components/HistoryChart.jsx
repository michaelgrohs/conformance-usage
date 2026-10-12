import { useLayoutEffect, useRef, useState } from 'react'

const CHART_HEIGHT = 100

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const RATE_HEIGHT = 96
const RATE_GRID_VALUES = [100, 50, 0]

// Daily conformance rate (%), as a line — built from real, measured HTML
// elements (a ResizeObserver on the plot area, same technique as the trace
// chevrons) rather than a scaled SVG viewBox. An SVG stretched to an
// arbitrary container width/height with preserveAspectRatio="none" can
// render the line faintly blurred/aliased at odd scale factors; plain
// pixel-positioned divs don't have that problem. Used in the shared
// overview (same content for all three groups — see CLAUDE.md).
export function ConformanceRateChart({ data }) {
  const plotRef = useRef(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = plotRef.current
    if (!el) return
    const measure = () => setWidth(el.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const points = data.map((d, i) => {
    const total = d.conforming + d.deviating
    const rate = total ? (d.conforming / total) * 100 : 0
    const x = data.length > 1 ? (i / (data.length - 1)) * width : 0
    const y = RATE_HEIGHT - (rate / 100) * RATE_HEIGHT
    return { date: d.date, rate, x, y }
  })

  const segments = points.slice(0, -1).map((p, i) => {
    const next = points[i + 1]
    const dx = next.x - p.x
    const dy = next.y - p.y
    return {
      left: p.x,
      top: p.y - 1,
      length: Math.sqrt(dx * dx + dy * dy),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    }
  })

  return (
    <div className="history-chart">
      <div className="rate-chart">
        <div className="rate-chart-labels" style={{ height: RATE_HEIGHT }}>
          {RATE_GRID_VALUES.map((g) => (
            <span key={g} className="rate-chart-label" style={{ top: RATE_HEIGHT - (g / 100) * RATE_HEIGHT }}>
              {g}%
            </span>
          ))}
        </div>
        <div className="rate-chart-plot" ref={plotRef} style={{ height: RATE_HEIGHT }}>
          {RATE_GRID_VALUES.map((g) => (
            <div key={g} className="rate-chart-gridline" style={{ top: RATE_HEIGHT - (g / 100) * RATE_HEIGHT }} />
          ))}
          {width > 0 &&
            segments.map((s, i) => (
              <div
                key={i}
                className="rate-chart-segment"
                style={{ left: s.left, top: s.top, width: s.length, transform: `rotate(${s.angle}deg)` }}
              />
            ))}
          {width > 0 &&
            points.map((p, i) => (
              <div
                key={i}
                className="rate-chart-dot"
                style={{ left: p.x, top: p.y }}
                title={`${formatDate(p.date)} — ${Math.round(p.rate)}% conforming`}
              />
            ))}
        </div>
      </div>
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
