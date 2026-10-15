import { useLayoutEffect, useRef, useState } from 'react'
import { useHoverTooltip } from '../hooks/useHoverTooltip.js'
import InfoTooltip from './InfoTooltip.jsx'

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
function Chevron({ activity, isFirst, filterState, onOpen, onShowTip, onHideTip }) {
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
  if (filterState === 'exclude') classes.push('chevron--filter-exclude')
  if (filterState === 'dim') classes.push('chevron--filter-dim')

  const tipText = `Click for "${activity}"'s execution frequency across all traces`

  return (
    <div
      className={classes.join(' ')}
      ref={ref}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onMouseEnter={(e) => onShowTip(e, tipText)}
      onMouseLeave={onHideTip}
      onFocus={(e) => onShowTip(e, tipText)}
      onBlur={onHideTip}
    >
      {size && (
        <svg className="chevron-shape" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <polygon points={points} />
        </svg>
      )}
      <span className="chevron-label">{activity}</span>
    </div>
  )
}

// `onOpenActivity(name)` surfaces the same process-model-activity detail
// (execution frequency) as clicking the activity in the process model —
// identical affordance/content across all three groups (see CLAUDE.md
// "Information architecture"). `onOpenTrace` surfaces the full trace
// detail (its event list) via the explicit "Trace details →" button, kept
// separate so the two click targets don't conflict. `activityFilter` is
// the global activity filter's AND/NOT conditions (see ActivityFilterBar)
// — must-include activities present in this trace are highlighted,
// must-exclude activities get a crossed-out treatment, the rest fade,
// exactly mirroring how the process model responds to the same filter.
// (Whether this trace's *variant* is even shown at all is decided one
// level up, in App.jsx, via filtering.js — this highlighting is
// supplementary, not the filtering itself.)
export default function TraceStrip({ variant, onOpenActivity, onOpenTrace, activityFilter = [] }) {
  const hasFilter = activityFilter.length > 0
  const { tooltip, show, hide } = useHoverTooltip()

  const conditionFor = (activity) => activityFilter.find((c) => c.activity === activity)

  return (
    <div className="panel trace-panel">
      <div className="panel-header">
        <h2>
          Recorded trace
          <InfoTooltip text="You can click any activity in the strip below for its execution frequency across all traces, or use Trace details for this trace's full event list and throughput time." />
        </h2>
        <button type="button" className="ghost-button" onClick={onOpenTrace}>
          Trace details →
        </button>
      </div>
      <p className="panel-hint">Click an activity for its execution frequency.</p>
      <div className="chevron-scroll" onScroll={hide}>
        <div className="chevron-row">
          {variant.trace.map((activity, i) => {
            const condition = conditionFor(activity)
            const filterState = !hasFilter ? null : condition?.mode === 'exclude' ? 'exclude' : condition ? 'match' : 'dim'
            return (
              <Chevron
                key={`${activity}-${i}`}
                activity={activity}
                isFirst={i === 0}
                filterState={filterState}
                onOpen={() => onOpenActivity(activity)}
                onShowTip={show}
                onHideTip={hide}
              />
            )
          })}
        </div>
      </div>
      {tooltip && (
        <div className="hover-tip-fixed" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
