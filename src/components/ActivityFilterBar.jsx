import { activityStats } from '../data/overviewStats.js'

const ALL_ACTIVITIES = Object.keys(activityStats)

// A global filter, noted here at the top of the page and applied
// identically to the process model and the recorded trace below (see
// CLAUDE.md "Information architecture" — this is the "Filter" step).
// Deliberately its own control rather than overloading the existing
// click-for-detail interaction on activities/traces, so the two don't
// conflict.
export default function ActivityFilterBar({ selected, onToggle, onClear }) {
  const available = ALL_ACTIVITIES.filter((a) => !selected.includes(a))

  return (
    <div className="panel filter-bar">
      <div className="filter-bar-row">
        <span className="filter-bar-label">Filter activities:</span>
        <select
          className="filter-bar-select"
          value=""
          onChange={(e) => {
            if (e.target.value) onToggle(e.target.value)
          }}
        >
          <option value="">+ Add activity…</option>
          {available.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <button type="button" className="ghost-button" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <div className="filter-chip-row">
          {selected.map((a) => (
            <button type="button" className="filter-chip" key={a} onClick={() => onToggle(a)}>
              {a} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
