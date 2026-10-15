import { useState } from 'react'
import { GROUPS, GROUP_LABELS } from '../data/variants.js'
import InfoTooltip from './InfoTooltip.jsx'

const ALL_GROUPS = [GROUPS.TRACE_ONLY, GROUPS.EVENT_LEVEL, GROUPS.PATTERN_LEVEL]

// Lets the researcher override the randomly-assigned group, for inspection
// and demo purposes. Hidden behind a small toggle so it doesn't read as
// part of the "participant" experience. See CLAUDE.md "Group assignment".
export default function AdminPanel({ group, onOverride, onResetToRandom }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-panel">
      <button
        type="button"
        className="admin-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-tooltip="Admin: override group assignment"
      >
        ⚙ Admin
      </button>
      {open && (
        <div className="admin-drawer">
          <p className="admin-current">
            Current group: <strong>{GROUP_LABELS[group]}</strong>
            <InfoTooltip
              below
              text="You can pick a representation below to preview it, instead of waiting for random assignment, then use Reset to random assignment to go back to picking a group at random."
            />
          </p>
          <div className="admin-options">
            {ALL_GROUPS.map((g) => (
              <label key={g} className="admin-option">
                <input
                  type="radio"
                  name="group-override"
                  checked={group === g}
                  onChange={() => onOverride(g)}
                />
                {GROUP_LABELS[g]}
              </label>
            ))}
          </div>
          <button type="button" className="ghost-button admin-reset" onClick={onResetToRandom}>
            Reset to random assignment
          </button>
        </div>
      )}
    </div>
  )
}
