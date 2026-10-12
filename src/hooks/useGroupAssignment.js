import { useCallback, useState } from 'react'
import { GROUPS } from '../data/variants.js'

const STORAGE_KEY = 'conformance-tool:group'
const ALL_GROUPS = [GROUPS.TRACE_ONLY, GROUPS.EVENT_LEVEL, GROUPS.PATTERN_LEVEL]

function randomGroup() {
  return ALL_GROUPS[Math.floor(Math.random() * ALL_GROUPS.length)]
}

function readStoredGroup() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return ALL_GROUPS.includes(stored) ? stored : null
  } catch {
    // sessionStorage can be unavailable (e.g. private browsing); fall back
    // to an in-memory assignment for this render.
    return null
  }
}

function writeStoredGroup(group) {
  try {
    sessionStorage.setItem(STORAGE_KEY, group)
  } catch {
    // ignore — assignment still works for this session, just won't persist
  }
}

// Default behaviour: assign a group uniformly at random on first load, then
// keep it stable for the rest of the browser session (so reloading the page
// doesn't reassign a different condition mid-session). The admin panel can
// override this assignment explicitly, or reset back to a fresh random draw.
export function useGroupAssignment() {
  const [group, setGroup] = useState(() => {
    const stored = readStoredGroup()
    if (stored) return stored
    const assigned = randomGroup()
    writeStoredGroup(assigned)
    return assigned
  })

  const overrideGroup = useCallback((next) => {
    if (!ALL_GROUPS.includes(next)) return
    writeStoredGroup(next)
    setGroup(next)
  }, [])

  const resetToRandom = useCallback(() => {
    const assigned = randomGroup()
    writeStoredGroup(assigned)
    setGroup(assigned)
  }, [])

  return { group, overrideGroup, resetToRandom }
}
