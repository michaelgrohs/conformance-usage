import { useEffect, useRef } from 'react'
import BpmnJS from 'bpmn-js/lib/NavigatedViewer'
import orderToCashBpmnXml from '../data/orderToCash.bpmn?raw'

const ZOOM_MIN = 0.2
const ZOOM_MAX = 4
const ZOOM_STEP = 1.2

// The model is wide (~2000px) relative to any reasonable panel width, so
// fitting its full width into view (bpmn-js's default 'fit-viewport')
// shrinks activity labels to near-illegible. Instead, default to a scale
// that fits the diagram's *height* (capped at 100%) and start scrolled to
// the beginning of the process — legible text, pan right to see the rest.
const START_EVENT_ID = 'StartEvent_1xaavxz'

function applyReadableDefaultView(canvas) {
  const { inner, outer } = canvas.viewbox()
  const widthFitScale = outer.width / inner.width
  const heightFitScale = outer.height / inner.height
  const fitViewportScale = Math.min(widthFitScale, heightFitScale)
  const scale = Math.max(fitViewportScale, Math.min(heightFitScale, 1))
  canvas.zoom(scale)
  canvas.scrollToElement(START_EVENT_ID, { left: 60 })
}

// Global activity filter, applied as bpmn-js marker classes rather than
// colour (consistent with the rest of the tool): matching tasks get a
// bolder outline, non-matching ones are faded. No marker at all when the
// filter is empty.
const FILTER_HIGHLIGHT = 'activity-filter-match'
const FILTER_DIM = 'activity-filter-dim'

function applyActivityFilter(viewer, activityFilter) {
  const elementRegistry = viewer.get('elementRegistry')
  const canvas = viewer.get('canvas')
  const tasks = elementRegistry.filter((el) => el.type === 'bpmn:Task')
  const hasFilter = activityFilter.length > 0
  tasks.forEach((el) => {
    canvas.removeMarker(el, FILTER_HIGHLIGHT)
    canvas.removeMarker(el, FILTER_DIM)
    if (!hasFilter) return
    canvas.addMarker(el, activityFilter.includes(el.businessObject?.name) ? FILTER_HIGHLIGHT : FILTER_DIM)
  })
}

// Renders the process model. This component is shared, unmodified, across
// all three groups (trace-only / event-level / pattern-level) — see the
// "equal chances" guideline in CLAUDE.md. NavigatedViewer gives every group
// the same zoom/pan/scroll affordances out of the box, plus the explicit
// zoom controls below (bpmn-js's default scroll-to-zoom needs Ctrl/Cmd held
// down — a plain scroll pans — so buttons are provided as a discoverable
// fallback rather than relying on that modifier alone).
//
// `onOpenActivity(name)` is called when a task is clicked — "details on
// demand" (execution frequency), identical content/affordance for every
// group since it isn't deviation-specific. Kept in a ref so the expensive
// diagram import effect doesn't need to re-run if the callback identity
// changes.
export default function ProcessModelViewer({ onOpenActivity, activityFilter = [] }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const onOpenActivityRef = useRef(onOpenActivity)
  const activityFilterRef = useRef(activityFilter)
  const readyRef = useRef(false)

  useEffect(() => {
    onOpenActivityRef.current = onOpenActivity
  }, [onOpenActivity])

  useEffect(() => {
    // Guards against React StrictMode's dev-mode double-invoke of effects:
    // without this, the first (soon-to-be-cleaned-up) viewer's async
    // importXML can resolve after it was already destroyed and throw.
    let cancelled = false
    const viewer = new BpmnJS({ container: containerRef.current })
    viewerRef.current = viewer

    viewer
      .importXML(orderToCashBpmnXml)
      .then(() => {
        if (cancelled) return
        applyReadableDefaultView(viewer.get('canvas'))
        viewer.get('eventBus').on('element.click', (e) => {
          const el = e.element
          if (el?.type === 'bpmn:Task' && el.businessObject?.name) {
            onOpenActivityRef.current?.(el.businessObject.name)
          }
        })
        readyRef.current = true
        applyActivityFilter(viewer, activityFilterRef.current)
      })
      .catch((err) => {
        if (cancelled) return
        // eslint-disable-next-line no-console
        console.error('Failed to render process model', err)
      })

    return () => {
      cancelled = true
      readyRef.current = false
      viewerRef.current = null
      try {
        viewer.destroy()
      } catch {
        // already destroyed / never finished initializing — ignore
      }
    }
  }, [])

  useEffect(() => {
    activityFilterRef.current = activityFilter
    if (readyRef.current && viewerRef.current) {
      applyActivityFilter(viewerRef.current, activityFilter)
    }
  }, [activityFilter])

  const withCanvas = (fn) => {
    const canvas = viewerRef.current?.get('canvas')
    if (canvas) fn(canvas)
  }

  const zoomBy = (factor) => {
    withCanvas((canvas) => {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, canvas.zoom() * factor))
      canvas.zoom(next)
    })
  }

  const resetZoom = () => withCanvas(applyReadableDefaultView)

  return (
    <div className="panel process-model-panel">
      <div className="panel-header">
        <h2>Process model</h2>
        <div className="zoom-controls">
          <button type="button" className="ghost-button" onClick={() => zoomBy(1 / ZOOM_STEP)} title="Zoom out">
            −
          </button>
          <button type="button" className="ghost-button" onClick={() => zoomBy(ZOOM_STEP)} title="Zoom in">
            +
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={resetZoom}
            title="Reset pan and zoom to the default view"
          >
            Reset view
          </button>
        </div>
      </div>
      <p className="panel-hint">
        Drag to pan. Use the +/− buttons, or hold Ctrl (⌘ on Mac) while scrolling, to zoom. Click
        an activity for its execution frequency.
      </p>
      <div
        className="bpmn-container"
        ref={containerRef}
        title="Click an activity for its execution frequency across all traces"
      />
    </div>
  )
}
