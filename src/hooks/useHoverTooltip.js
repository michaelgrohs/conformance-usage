import { useCallback, useState } from 'react'

// Tracks a tooltip's text + viewport position from the hovered element's
// bounding box, for use with a `position: fixed` tooltip. Needed instead of
// the plain CSS `[data-tooltip]::after` pattern (see styles.css) for
// elements that live inside a horizontally-scrolling container
// (`.chevron-scroll`, `.table-scroll`): `overflow-x: auto` forces
// `overflow-y` to clip too (a standard CSS rule), so a tooltip positioned
// relative to the element would get cut off. A `position: fixed` tooltip
// escapes that clip, since its containing block is the viewport rather than
// the scrolling ancestor.
export function useHoverTooltip() {
  const [tooltip, setTooltip] = useState(null)

  const show = useCallback((e, text) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top })
  }, [])

  const hide = useCallback(() => setTooltip(null), [])

  return { tooltip, show, hide }
}
