// The three order-to-cash trace variants available in the tool, selectable
// via the dropdown as "Variant 1/2/3" — deliberately neutral labels, since
// the dropdown must not reveal which variants conform or deviate (that's
// conformance information, which only belongs in the "Conformance checking
// results" panel — see CLAUDE.md). See CLAUDE.md "Data sourcing" for exact
// provenance of each.
//
// Each variant carries:
// - trace: the recorded sequence of activity names.
// - conforming: whether it deviates from the model at all.
// - eventLevelAlignment: the two-row alignment (see ConformancePanel). Each
//   non-sync move carries a `deviationId` linking it to the deviation it's
//   part of (a replace/skip/swap spans two adjacent moves).
// - patternLevelDeviations: the pattern-level diagnostic list. Each entry's
//   `id` matches the `deviationId`s above and the keys in
//   overviewStats.deviationStats, so clicking into "the same" deviation
//   from either representation opens the same detail-panel content.

export const GROUPS = {
  TRACE_ONLY: 'trace-only',
  EVENT_LEVEL: 'event-level',
  PATTERN_LEVEL: 'pattern-level',
}

export const GROUP_LABELS = {
  [GROUPS.TRACE_ONLY]: 'Trace-only',
  [GROUPS.EVENT_LEVEL]: 'Event-level',
  [GROUPS.PATTERN_LEVEL]: 'Pattern-level',
}

export const VARIANT_IDS = {
  DEVIATION_A: 'deviation-a',
  DEVIATION_B: 'deviation-b',
  CONFORMANT: 'conformant',
}

export const variants = {
  [VARIANT_IDS.DEVIATION_A]: {
    id: VARIANT_IDS.DEVIATION_A,
    label: 'Variant 1',
    source: 'Qualtrics export: "Order-to-cash – Deviation Identification Task"',
    conforming: false,
    trace: [
      'Create Order',
      'Check Order',
      'Change Order',
      'Change Order',
      'Approve Order',
      'Order Materials',
      'Send Reminder',
      'Archive Check',
      'Ship Order',
      'Clear Invoice',
      'Ship Order',
    ],
    eventLevelAlignment: [
      { trace: 'Create Order', model: 'Create Order', moveType: 'sync' },
      { trace: 'Check Order', model: 'Check Order', moveType: 'sync' },
      { trace: 'Change Order', model: '>>', moveType: 'log', deviationId: 'insert-change-order' },
      { trace: 'Change Order', model: '>>', moveType: 'log', deviationId: 'insert-change-order' },
      { trace: 'Approve Order', model: 'Approve Order', moveType: 'sync' },
      { trace: 'Order Materials', model: 'Order Materials', moveType: 'sync' },
      { trace: '>>', model: 'Assemble Products', moveType: 'model', deviationId: 'skip-assemble-send-invoice' },
      { trace: '>>', model: 'Send Invoice', moveType: 'model', deviationId: 'skip-assemble-send-invoice' },
      { trace: 'Send Reminder', model: 'Send Reminder', moveType: 'sync' },
      { trace: 'Archive Check', model: 'Archive Check', moveType: 'sync' },
      { trace: 'Ship Order', model: 'Ship Order', moveType: 'sync' },
      { trace: 'Clear Invoice', model: 'Clear Invoice', moveType: 'sync' },
      { trace: 'Ship Order', model: '>>', moveType: 'log', deviationId: 'repeat-ship-order' },
    ],
    patternLevelDeviations: [
      {
        id: 'insert-change-order',
        pattern: 'Insert',
        parts: [
          { text: '⟨Change Order, Change Order⟩', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'inserted', style: 'u' },
        ],
      },
      {
        id: 'skip-assemble-send-invoice',
        pattern: 'Skip',
        parts: [
          { text: '⟨Assemble Products, Send Invoice⟩', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'skipped', style: 'u' },
        ],
      },
      {
        id: 'repeat-ship-order',
        pattern: 'Repeat',
        parts: [
          { text: 'Ship Order', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'repeated', style: 'u' },
        ],
      },
    ],
  },

  [VARIANT_IDS.DEVIATION_B]: {
    id: VARIANT_IDS.DEVIATION_B,
    label: 'Variant 2',
    source: 'Qualtrics export: "Order-to-cash – Correction Proposal Task"',
    conforming: false,
    trace: [
      'Create Order',
      'Request Materials',
      'Approve Order',
      'Archive Check',
      'Order Materials',
      'Adjust Materials',
      'Assemble Products',
      'Ship Order',
      'Send Invoice',
      'Clear Invoice',
    ],
    eventLevelAlignment: [
      { trace: 'Create Order', model: 'Create Order', moveType: 'sync' },
      { trace: 'Request Materials', model: '>>', moveType: 'log', deviationId: 'replace-check-order' },
      { trace: '>>', model: 'Check Order', moveType: 'model', deviationId: 'replace-check-order' },
      { trace: 'Approve Order', model: 'Approve Order', moveType: 'sync' },
      { trace: 'Archive Check', model: 'Archive Check', moveType: 'sync' },
      { trace: 'Order Materials', model: 'Order Materials', moveType: 'sync' },
      { trace: 'Adjust Materials', model: '>>', moveType: 'log', deviationId: 'insert-adjust-materials' },
      { trace: 'Assemble Products', model: 'Assemble Products', moveType: 'sync' },
      { trace: 'Ship Order', model: '>>', moveType: 'log', deviationId: 'swap-ship-send-invoice' },
      { trace: 'Send Invoice', model: 'Send Invoice', moveType: 'sync' },
      { trace: '>>', model: 'Ship Order', moveType: 'model', deviationId: 'swap-ship-send-invoice' },
      { trace: 'Clear Invoice', model: 'Clear Invoice', moveType: 'sync' },
    ],
    patternLevelDeviations: [
      {
        id: 'replace-check-order',
        pattern: 'Replace',
        parts: [
          { text: 'Check Order', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'replaced by', style: 'u' },
          { text: ' Request Materials', style: 'i' },
        ],
      },
      {
        id: 'insert-adjust-materials',
        pattern: 'Insert',
        parts: [
          { text: 'Adjust Materials', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'inserted', style: 'u' },
        ],
      },
      {
        id: 'swap-ship-send-invoice',
        pattern: 'Swap',
        parts: [
          { text: 'Ship Order', style: 'i' },
          { text: ' is ', style: '' },
          { text: 'executed before, rather than after', style: 'u' },
          { text: ' Send Invoice', style: 'i' },
        ],
      },
    ],
  },

  [VARIANT_IDS.CONFORMANT]: {
    id: VARIANT_IDS.CONFORMANT,
    label: 'Variant 3',
    source: 'Fabricated: a short valid execution of the model (no optional back-order/reminder)',
    conforming: true,
    trace: [
      'Create Order',
      'Check Order',
      'Approve Order',
      'Archive Check',
      'Assemble Products',
      'Send Invoice',
      'Ship Order',
      'Clear Invoice',
    ],
    eventLevelAlignment: [
      { trace: 'Create Order', model: 'Create Order', moveType: 'sync' },
      { trace: 'Check Order', model: 'Check Order', moveType: 'sync' },
      { trace: 'Approve Order', model: 'Approve Order', moveType: 'sync' },
      { trace: 'Archive Check', model: 'Archive Check', moveType: 'sync' },
      { trace: 'Assemble Products', model: 'Assemble Products', moveType: 'sync' },
      { trace: 'Send Invoice', model: 'Send Invoice', moveType: 'sync' },
      { trace: 'Ship Order', model: 'Ship Order', moveType: 'sync' },
      { trace: 'Clear Invoice', model: 'Clear Invoice', moveType: 'sync' },
    ],
    patternLevelDeviations: [],
  },
}

export const variantList = Object.values(variants)
