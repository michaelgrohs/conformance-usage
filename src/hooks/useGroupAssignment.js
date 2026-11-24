import { useCallback, useState } from 'react'
import { ALL_GROUPS, groupForParticipant, parseParticipantNumber, randomGroup } from '../data/assignment.js'

// Which group this browser tab shows, in order of precedence:
// 1. an admin override (set in the password-protected settings panel),
// 2. the participant number in the link (?p=N) → block randomisation,
// 3. otherwise a random group, drawn once and kept for the browser session.
// See assignment.js and CLAUDE.md "Group assignment".

const OVERRIDE_KEY = 'conformance-tool:group-override'
const RANDOM_KEY = 'conformance-tool:group'

function read(key) {
  try {
    const v = sessionStorage.getItem(key)
    return ALL_GROUPS.includes(v) ? v : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // sessionStorage unavailable (e.g. some private modes): assignment still
    // works for this page view, it just won't survive a reload.
  }
}

function automaticAssignment() {
  const participant = parseParticipantNumber(window.location.search)
  if (participant != null) {
    return { group: groupForParticipant(participant), source: 'participant', participant }
  }
  let group = read(RANDOM_KEY)
  if (!group) {
    group = randomGroup()
    write(RANDOM_KEY, group)
  }
  return { group, source: 'random', participant: null }
}

function initialState() {
  const override = read(OVERRIDE_KEY)
  const auto = automaticAssignment()
  return override ? { ...auto, group: override, source: 'override' } : auto
}

export function useGroupAssignment() {
  const [state, setState] = useState(initialState)

  const overrideGroup = useCallback((next) => {
    if (!ALL_GROUPS.includes(next)) return
    write(OVERRIDE_KEY, next)
    setState((s) => ({ ...s, group: next, source: 'override' }))
  }, [])

  // Drops the override and goes back to the automatic assignment (the
  // participant number if the link has one, otherwise the session's random
  // draw).
  const resetToAutomatic = useCallback(() => {
    write(OVERRIDE_KEY, null)
    setState(automaticAssignment())
  }, [])

  return { ...state, overrideGroup, resetToAutomatic }
}
