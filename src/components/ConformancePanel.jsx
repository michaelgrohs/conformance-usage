import { GROUPS } from '../data/variants.js'

// Matches the alignment table + legend as shown in guide_event_level.pdf /
// the Qualtrics export: a plain black-and-white grid, no colour-coding by
// move type (the legend explains the move type via the A / >> notation
// itself, not via colour). Non-sync cells belonging to a deviation are
// clickable — "details on demand" entered via this group's own
// representation (see CLAUDE.md).
function EventLevelView({ variant, onOpenDeviation }) {
  const alignment = variant.eventLevelAlignment
  return (
    <>
      <div className="table-scroll">
        <table className="alignment-table">
          <tbody>
            <tr>
              <th scope="row">Trace</th>
              {alignment.map((move, i) => (
                <td
                  key={i}
                  className={move.deviationId ? 'is-clickable' : undefined}
                  onClick={move.deviationId ? () => onOpenDeviation(move.deviationId) : undefined}
                >
                  {move.trace}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Model sequence</th>
              {alignment.map((move, i) => (
                <td
                  key={i}
                  className={move.deviationId ? 'is-clickable' : undefined}
                  onClick={move.deviationId ? () => onOpenDeviation(move.deviationId) : undefined}
                >
                  {move.model}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {alignment.some((m) => m.deviationId) && (
        <p className="panel-hint">Click a highlighted move to see its frequency, history and throughput impact.</p>
      )}

      <table className="legend-table">
        <tbody>
          <tr>
            <th>Legend</th>
            <td>A</td>
            <td>&gt;&gt;</td>
            <td>C</td>
          </tr>
          <tr>
            <th />
            <td>A</td>
            <td>B</td>
            <td>&gt;&gt;</td>
          </tr>
          <tr>
            <th />
            <td>Synchronous move</td>
            <td>Model move</td>
            <td>Log move</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

function PatternPartText({ parts }) {
  return parts.map((part, i) => {
    if (part.style === 'i') return <em key={i}>{part.text}</em>
    if (part.style === 'u') return <u key={i}>{part.text}</u>
    return <span key={i}>{part.text}</span>
  })
}

// Matches the pattern-level diagnostic layout from guide_pattern_level.pdf /
// the Qualtrics export: a bold pattern label, a thin divider, and the
// description with activity fragments in italics and the deviation verb
// underlined. Each row is clickable — same "details on demand" destination
// as the corresponding event-level move pair (same deviationId).
function PatternLevelView({ variant, onOpenDeviation }) {
  if (variant.patternLevelDeviations.length === 0) {
    return <p className="panel-empty">No deviations were found — this case conforms to the process model.</p>
  }
  return (
    <div className="pattern-list">
      {variant.patternLevelDeviations.map((d) => (
        <div className="pattern-row is-clickable" key={d.id} onClick={() => onOpenDeviation(d.id)}>
          <span className="pattern-label">{d.pattern}</span>
          <span className="pattern-divider" />
          <span className="pattern-description">
            <PatternPartText parts={d.parts} />
          </span>
        </div>
      ))}
    </div>
  )
}

// Not rendered at all for the trace-only group (see App.jsx) — that's the
// experimental baseline, so there's no "Conformance checking results"
// section for it, rather than an empty one. See CLAUDE.md.
export default function ConformancePanel({ group, variant, onOpenDeviation }) {
  return (
    <div className="panel conformance-panel">
      <div className="panel-header">
        <h2>Conformance checking results</h2>
      </div>
      {group === GROUPS.EVENT_LEVEL && <EventLevelView variant={variant} onOpenDeviation={onOpenDeviation} />}
      {group === GROUPS.PATTERN_LEVEL && <PatternLevelView variant={variant} onOpenDeviation={onOpenDeviation} />}
    </div>
  )
}
