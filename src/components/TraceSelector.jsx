import { variantList } from '../data/variants.js'

// The "select/filter" step between the overview and the per-trace detail —
// filtering proper was judged not relevant for this tool, so a dropdown
// over the (small, fixed) collection of trace variants stands in for it.
// Identical across all three groups. Deliberately doesn't hint at which
// variants conform or deviate — see variants.js.
export default function TraceSelector({ selectedId, onChange }) {
  return (
    <label className="trace-selector">
      <span className="trace-selector-label" title="Switch which trace is shown below and in the conformance results">
        Trace:
      </span>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        title="Switch which trace is shown below and in the conformance results"
      >
        {variantList.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </label>
  )
}
