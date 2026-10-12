import { useLayoutEffect, useRef, useState } from 'react'

const NOTCH_PX = 14

// Renders the recorded trace as a row of pointed "chevron" labels, matching
// the visual convention used throughout the study materials (e.g.
// submission.pdf Figure 2, the Qualtrics export). Identical for every
// group.
//
// The shape is an SVG polygon stretched behind the label, measured in the
// chevron's own real rendered pixels (via ResizeObserver) rather than a
// CSS clip-path or a percentage-based SVG viewBox. That matters: a
// percentage-based notch would cut deeper on wide labels than on narrow
// ones, while the fixed -14px overlap between chevrons stays constant —
// so the two drift out of alignment and the shapes visibly overlap
// instead of interlocking. Measuring real pixels keeps the notch depth
// fixed regardless of label length, so every chevron lines up with its
// neighbor exactly.
function Chevron({ activity, isFirst }) {
  const ref = useRef(null)
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = size?.w ?? 0
  const h = size?.h ?? 0
  const points = isFirst
    ? `0,0 ${w - NOTCH_PX},0 ${w},${h / 2} ${w - NOTCH_PX},${h} 0,${h}`
    : `0,0 ${w - NOTCH_PX},0 ${w},${h / 2} ${w - NOTCH_PX},${h} 0,${h} ${NOTCH_PX},${h / 2}`

  return (
    <div className={isFirst ? 'chevron chevron--first' : 'chevron'} ref={ref}>
      {size && (
        <svg className="chevron-shape" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <polygon points={points} />
        </svg>
      )}
      <span className="chevron-label">{activity}</span>
    </div>
  )
}

// `onOpenCase` surfaces the case-detail panel for the currently selected
// variant — identical affordance/content across all three groups (see
// CLAUDE.md "Information architecture").
export default function TraceStrip({ variant, onOpenCase }) {
  return (
    <div className="panel trace-panel">
      <div className="panel-header">
        <h2>Recorded trace</h2>
        <button type="button" className="ghost-button" onClick={onOpenCase}>
          Case details →
        </button>
      </div>
      <div className="chevron-scroll">
        <div className="chevron-row" onClick={onOpenCase} role="button" tabIndex={0}>
          {variant.trace.map((activity, i) => (
            <Chevron key={`${activity}-${i}`} activity={activity} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
