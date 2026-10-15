import { useCallback, useEffect, useMemo, useState } from 'react'
import { GROUP_LABELS, GROUPS, VARIANT_IDS, variants } from './data/variants.js'
import { matchingVariants } from './data/filtering.js'
import { useGroupAssignment } from './hooks/useGroupAssignment.js'
import ProcessModelViewer from './components/ProcessModelViewer.jsx'
import OverviewStats from './components/OverviewStats.jsx'
import ActivityFilterBar from './components/ActivityFilterBar.jsx'
import TraceSelector from './components/TraceSelector.jsx'
import TraceStrip from './components/TraceStrip.jsx'
import ConformancePanel from './components/ConformancePanel.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const { group, overrideGroup, resetToRandom } = useGroupAssignment()
  const [variantId, setVariantId] = useState(VARIANT_IDS.DEVIATION_A)
  const [selection, setSelection] = useState(null)
  // Global activity filter — a list of `{ activity, mode }` AND/NOT
  // conditions, applied identically regardless of group. It actually
  // narrows the data (which trace variants are selectable, the Overview
  // dashboard's numbers) rather than just highlighting within it — see
  // filtering.js and CLAUDE.md "Information architecture". Highlighting in
  // the process model and trace is an additional affordance on top of
  // that, not a substitute for it.
  const [activityFilter, setActivityFilter] = useState([])

  const addCondition = useCallback((activity) => {
    setActivityFilter((prev) => (prev.some((c) => c.activity === activity) ? prev : [...prev, { activity, mode: 'include' }]))
  }, [])
  const toggleConditionMode = useCallback((activity) => {
    setActivityFilter((prev) =>
      prev.map((c) => (c.activity === activity ? { ...c, mode: c.mode === 'exclude' ? 'include' : 'exclude' } : c)),
    )
  }, [])
  const removeCondition = useCallback((activity) => {
    setActivityFilter((prev) => prev.filter((c) => c.activity !== activity))
  }, [])
  const clearActivityFilter = useCallback(() => setActivityFilter([]), [])

  const matched = useMemo(() => matchingVariants(activityFilter), [activityFilter])
  const matchedIds = useMemo(() => new Set(matched.map((v) => v.id)), [matched])

  // Keep the selected trace variant valid as the filter changes: if it
  // stops matching, fall back to the first variant that still does (or no
  // selection at all if none do).
  useEffect(() => {
    if (matchedIds.has(variantId)) return
    setVariantId(matched[0]?.id ?? null)
  }, [matchedIds, matched, variantId])

  const variant = variantId ? variants[variantId] : null

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Conformance Checking Explorer</h1>
          <p className="subtitle">Order-to-cash process</p>
        </div>
        <span className="group-badge">{GROUP_LABELS[group]}</span>
      </header>

      <main className="app-main">
        <ActivityFilterBar
          conditions={activityFilter}
          onAdd={addCondition}
          onToggleMode={toggleConditionMode}
          onRemove={removeCondition}
          onClear={clearActivityFilter}
        />

        <OverviewStats activityFilter={activityFilter} />

        <ProcessModelViewer
          onOpenActivity={(name) => setSelection({ type: 'activity', id: name })}
          activityFilter={activityFilter}
        />

        <TraceSelector variants={matched} selectedId={variantId} onChange={setVariantId} />
        {variant ? (
          <TraceStrip
            variant={variant}
            onOpenActivity={(name) => setSelection({ type: 'activity', id: name })}
            onOpenTrace={() => setSelection({ type: 'trace', id: variantId })}
            activityFilter={activityFilter}
          />
        ) : (
          <div className="panel trace-panel">
            <div className="panel-header">
              <h2>Recorded trace</h2>
            </div>
            <p className="panel-empty">No trace variant matches the active filter.</p>
          </div>
        )}

        {group !== GROUPS.TRACE_ONLY && variant && (
          <ConformancePanel
            group={group}
            variant={variant}
            onOpenDeviation={(id) => setSelection({ type: 'deviation', id })}
          />
        )}
      </main>

      <DetailPanel selection={selection} onClose={() => setSelection(null)} />

      <AdminPanel group={group} onOverride={overrideGroup} onResetToRandom={resetToRandom} />
    </div>
  )
}
