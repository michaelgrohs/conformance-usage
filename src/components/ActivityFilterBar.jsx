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
        <span
          className="filter-bar-label"
          title="Highlight activities in the process model and the recorded trace, and fade everything else. Applies to every trace variant and group."
        >
          Filter activities:
        </span>
        <select
          className="filter-bar-select"
          value=""
          title="Add an activity to the filter"
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
          <button type="button" className="ghost-button" onClick={onClear} title="Remove all activity filters">
            Clear all
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <div className="filter-chip-row">
          {selected.map((a) => (
            <button
              type="button"
              className="filter-chip"
              key={a}
              onClick={() => onToggle(a)}
              title={`Remove "${a}" from the filter`}
            >
              {a} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
