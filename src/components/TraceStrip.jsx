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
function Chevron({ activity, isFirst, filterState }) {
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

  const classes = ['chevron']
  if (isFirst) classes.push('chevron--first')
  if (filterState === 'match') classes.push('chevron--filter-match')
  if (filterState === 'dim') classes.push('chevron--filter-dim')

  return (
    <div className={classes.join(' ')} ref={ref}>
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
// CLAUDE.md "Information architecture"). `activityFilter` is the global
// activity filter (see ActivityFilterBar) — matching activities are
// highlighted, the rest faded, exactly mirroring how the process model
// responds to the same filter.
export default function TraceStrip({ variant, onOpenCase, activityFilter = [] }) {
  const hasFilter = activityFilter.length > 0

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
            <Chevron
              key={`${activity}-${i}`}
              activity={activity}
              isFirst={i === 0}
              filterState={!hasFilter ? null : activityFilter.includes(activity) ? 'match' : 'dim'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
