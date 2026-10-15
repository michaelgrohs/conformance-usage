import { useCallback, useState } from 'react'
import { GROUP_LABELS, GROUPS, VARIANT_IDS, variants } from './data/variants.js'
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
  // Global activity filter — applies identically to the process model and
  // the recorded trace, regardless of variant/group. See CLAUDE.md
  // "Information architecture".
  const [activityFilter, setActivityFilter] = useState([])

  const toggleActivityFilter = useCallback((name) => {
    setActivityFilter((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]))
  }, [])
  const clearActivityFilter = useCallback(() => setActivityFilter([]), [])

  const variant = variants[variantId]

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
        <ActivityFilterBar selected={activityFilter} onToggle={toggleActivityFilter} onClear={clearActivityFilter} />

        <ProcessModelViewer
          onOpenActivity={(name) => setSelection({ type: 'activity', id: name })}
          activityFilter={activityFilter}
        />

        <OverviewStats />

        <TraceSelector selectedId={variantId} onChange={setVariantId} />
        <TraceStrip
          variant={variant}
          onOpenCase={() => setSelection({ type: 'case', id: variantId })}
          activityFilter={activityFilter}
        />

        {group !== GROUPS.TRACE_ONLY && (
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
