// A small circled-"i" hover-help icon. Mirrors the pattern used in the
// sibling 02_/03_ Desirability tools (MUI's
// `<Tooltip arrow><IconButton><InfoIcon/></IconButton></Tooltip>`, placed
// beside a heading/label, hover-triggered, muted gray, with an arrow
// caret) — this project has no MUI, so the icon/bubble are plain CSS
// instead of the MUI glyph, but the pattern is the same: the explanation
// sits behind its own dedicated icon next to the thing it explains,
// rather than being glued onto the label text or an actual control (a
// label isn't an obvious hover target; a button's own text already is,
// so buttons keep plain tooltips instead of this icon — see CLAUDE.md).
export default function InfoTooltip({ text, below = false }) {
  return (
    <span
      className={`info-tooltip${below ? ' tooltip-below' : ''}`}
      data-tooltip={text}
      tabIndex={0}
      role="img"
      aria-label="More information"
    >
      i
    </span>
  )
}
