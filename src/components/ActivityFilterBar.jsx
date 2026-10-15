import { activityStats } from '../data/overviewStats.js'
import { computeFilteredOverview, matchingVariants } from '../data/filtering.js'
import { variantList } from '../data/variants.js'
import InfoTooltip from './InfoTooltip.jsx'

const ALL_ACTIVITIES = Object.keys(activityStats)
const UNFILTERED_TOTAL = 312

// A global filter, noted here at the top of the page and applied
// identically to the process model and the recorded trace below (see
// CLAUDE.md "Information architecture" — this is the "Filter" step).
// Deliberately its own control rather than overloading the existing
// click-for-detail interaction on activities/traces, so the two don't
// conflict.
//
// This actually narrows the data down (real filtering, not just
// highlighting): `conditions` is a list of `{ activity, mode }`, each
// independently "must include" (AND) or "must exclude" (NOT); a
// trace/variant has to satisfy every condition. See filtering.js for the
// matching logic shared with OverviewStats and TraceSelector.
export default function ActivityFilterBar({ conditions, onAdd, onToggleMode, onRemove, onClear }) {
  const selectedNames = conditions.map((c) => c.activity)
  const available = ALL_ACTIVITIES.filter((a) => !selectedNames.includes(a))
  const hasFilter = conditions.length > 0

  const overview = hasFilter ? computeFilteredOverview(conditions) : null
  const matchedVariants = hasFilter ? matchingVariants(conditions) : variantList

  return (
    <div className="panel filter-bar">
      <div className="filter-bar-row">
        <span className="filter-bar-label">
          Filter activities:
          <InfoTooltip
            below
            text="You can narrow the traces shown below, and the Overview numbers, down to only those that match. Pick an activity from the dropdown to add it as a rule, then set each rule to either “must include” or “must exclude”. Matching activities also get a bolder outline in the process model and trace, as a visual aid on top of the actual filtering."
          />
        </span>
        <select
          className="filter-bar-select"
          value=""
          onChange={(e) => {
            if (e.target.value) onAdd(e.target.value)
          }}
        >
          <option value="">+ Add activity…</option>
          {available.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {hasFilter && (
          <span className="filter-bar-clear-group">
            <button type="button" className="ghost-button" onClick={onClear}>
              Clear all
            </button>
            <InfoTooltip
              below
              text="You can clear every rule at once here, instead of removing them one by one."
            />
          </span>
        )}
      </div>
      {hasFilter && (
        <div className="filter-rules">
          <div className="filter-rules-header">
            <span className="filter-rules-title">
              Active rules ({conditions.length})
              <InfoTooltip
                below
                text="You can click a rule's AND/NOT badge to flip it between “must include” and “must exclude”, and use its Remove button to drop just that one rule — the others stay active."
              />
            </span>
            <span>All rules must match (AND)</span>
          </div>
          <div className="filter-rules-list">
            {conditions.map((c) => (
              <div className="filter-rule-row" key={c.activity}>
                <button
                  type="button"
                  className={`filter-rule-mode filter-rule-mode--${c.mode}`}
                  onClick={() => onToggleMode(c.activity)}
                >
                  {c.mode === 'exclude' ? 'NOT' : 'AND'}
                </button>
                <span className="filter-rule-name">{c.activity}</span>
                <button type="button" className="filter-rule-remove" onClick={() => onRemove(c.activity)}>
                  Remove
                </button>
                <InfoTooltip
                  text={
                    c.mode === 'exclude'
                      ? `This rule excludes traces with “${c.activity}”. You can click the NOT badge to flip it back to “must include”, or use Remove to drop just this one rule.`
                      : `This rule requires “${c.activity}”. You can click the AND badge to flip it to “must exclude” (NOT) instead, or use Remove to drop just this one rule.`
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {hasFilter && (
        <p className="panel-hint overview-filter-note">
          Matches {overview.total} of {UNFILTERED_TOTAL} traces overall, and {matchedVariants.length} of{' '}
          {variantList.length} explorable trace variants.
        </p>
      )}
    </div>
  )
}
