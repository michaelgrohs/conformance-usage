import InfoTooltip from './InfoTooltip.jsx'

// The "select" step between the overview and the per-trace detail — a
// dropdown over the (small, fixed) collection of trace variants.
// Identical across all three groups. Deliberately doesn't hint at which
// variants conform or deviate — see variants.js.
//
// `variants` is the list of variants that currently satisfy the activity
// filter (see filtering.js / ActivityFilterBar) — options outside that set
// aren't shown at all, since the filter actually narrows the data rather
// than just highlighting within it. If nothing matches, there's nothing to
// select.
export default function TraceSelector({ variants, selectedId, onChange }) {
  if (variants.length === 0) {
    return (
      <div className="trace-selector">
        <span className="trace-selector-label">Trace:</span>
        <span className="panel-empty">No trace matches the active filter.</span>
      </div>
    )
  }

  return (
    <div className="trace-selector">
      <label htmlFor="trace-select" className="trace-selector-label">
        Trace:
      </label>
      <InfoTooltip text="You can switch which of the available trace variants is shown below, and in the conformance results." />
      <select id="trace-select" value={selectedId ?? ''} onChange={(e) => onChange(e.target.value)}>
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  )
}
