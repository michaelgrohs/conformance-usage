import { useState } from 'react'
import { GROUP_LABELS } from '../data/variants.js'
import { ALL_GROUPS, groupForParticipant, participantLink, sha256Hex } from '../data/assignment.js'
import { ADMIN_PASSWORD_SHA256 } from '../config.js'
import InfoTooltip from './InfoTooltip.jsx'

const UNLOCK_KEY = 'conformance-tool:admin-unlocked'

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === ADMIN_PASSWORD_SHA256 && ADMIN_PASSWORD_SHA256 !== ''
  } catch {
    return false
  }
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function sourceText(source, participant) {
  if (source === 'override') return 'manually here'
  if (source === 'participant') return `from participant number ${participant} in the link`
  return 'random (no participant number in the link)'
}

// Settings control for the study team. Participants only ever see a small
// gear icon; everything behind it requires the admin password (hash in
// src/config.js). Nothing in the locked state reveals that groups exist.
export default function AdminPanel({ group, source, participant, onOverride, onResetToAutomatic }) {
  const [open, setOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [linkNumber, setLinkNumber] = useState('')

  const tryUnlock = async (e) => {
    e.preventDefault()
    setError('')
    if (!ADMIN_PASSWORD_SHA256) {
      setError('No password has been set yet.')
      return
    }
    let hash
    try {
      hash = await sha256Hex(password)
    } catch {
      setError('This browser can’t check the password here.')
      return
    }
    if (hash === ADMIN_PASSWORD_SHA256) {
      setUnlocked(true)
      setPassword('')
      try {
        sessionStorage.setItem(UNLOCK_KEY, hash)
      } catch {
        // stays unlocked for this page view only
      }
    } else {
      setError('Wrong password.')
    }
  }

  const lock = () => {
    setUnlocked(false)
    try {
      sessionStorage.removeItem(UNLOCK_KEY)
    } catch {
      // ignore
    }
  }

  const n = /^\d+$/.test(linkNumber) && Number(linkNumber) >= 1 ? Number(linkNumber) : null

  return (
    <div className="admin-panel">
      <button
        type="button"
        className="admin-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Settings"
        data-tooltip="Settings (password required)"
      >
        <GearIcon />
      </button>
      {open && (
        <div className="admin-drawer">
          {!unlocked ? (
            <form onSubmit={tryUnlock} className="admin-login">
              <label className="admin-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="ghost-button admin-reset" data-tooltip="Unlocks the settings for this browser session">
                Unlock
              </button>
            </form>
          ) : (
            <>
              <p className="admin-current">
                Current group: <strong>{GROUP_LABELS[group]}</strong>
                <InfoTooltip
                  below
                  text="You can switch this browser tab to another group below, for inspection or to correct an assignment. Use “Back to automatic assignment” to undo that."
                />
              </p>
              <p className="admin-source">Assigned {sourceText(source, participant)}.</p>
              <div className="admin-options">
                {ALL_GROUPS.map((g) => (
                  <label key={g} className="admin-option">
                    <input type="radio" name="group-override" checked={group === g} onChange={() => onOverride(g)} />
                    {GROUP_LABELS[g]}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="ghost-button admin-reset"
                onClick={onResetToAutomatic}
                data-tooltip="Removes the manual choice: the group then comes from the participant number in the link, or is drawn at random if there is none."
              >
                Back to automatic assignment
              </button>

              <div className="admin-section">
                <label className="admin-label" htmlFor="admin-link-number">
                  Participant link
                  <InfoTooltip
                    below
                    text="You can type a participant number to get that participant’s personal link and see which group it assigns. Hand out numbers 1, 2, 3, … in order, without gaps, to keep the groups balanced."
                  />
                </label>
                <input
                  id="admin-link-number"
                  type="text"
                  inputMode="numeric"
                  className="admin-input"
                  placeholder="e.g. 7"
                  value={linkNumber}
                  onChange={(e) => setLinkNumber(e.target.value.trim())}
                />
                {n && (
                  <p className="admin-link">
                    <code>{participantLink(n)}</code>
                    <br />→ {GROUP_LABELS[groupForParticipant(n)]}
                  </p>
                )}
              </div>

              <button type="button" className="ghost-button admin-reset admin-lock" onClick={lock} data-tooltip="Locks the settings again; the password is needed next time.">
                Lock
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
