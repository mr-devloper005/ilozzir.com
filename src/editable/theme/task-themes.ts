import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Cinematic dark "Arlox" task surfaces.

  Every task (archive + detail) shares one cohesive premium identity: near-black
  page bg, cream/off-white text, vibrant lime accent, big rounded corners,
  oversized display type. Per-task copy (kicker / note) still varies so each
  section keeps a little voice, but the visual language is unified. Tokens are
  delivered via CSS variables (`--tk-*`).
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const ARLOX_DISPLAY_FONT = "'Syne', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const ARLOX_BODY_FONT = "'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

// Shared cinematic dark palette — every task inherits this; only kicker/note differ.
const base = {
  dark: true,
  fontDisplay: ARLOX_DISPLAY_FONT,
  fontBody: ARLOX_BODY_FONT,
  bg: '#0F0E0C',
  surface: '#1B1A17',
  raised: '#221F1B',
  text: '#F1EDE4',
  muted: '#9A968D',
  line: 'rgba(241,237,228,0.10)',
  accent: '#E8FF5C',
  accentSoft: '#2A2E1A',
  onAccent: '#0F0E0C',
  glow: 'rgba(232,255,92,0.10)',
  radius: '2rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'In-depth reads, guides and stories worth your time.' },
  listing: { ...base, kicker: 'Businesses', note: 'Find, compare and connect with local businesses.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers and listings, ready to act on.' },
  image: { ...base, kicker: 'Photos', note: 'A visual feed of standout images and galleries.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated resources and links worth saving.' },
  pdf: { ...base, kicker: 'Documents', note: 'Downloadable guides, reports and references.' },
  profile: { ...base, kicker: 'People', note: 'Discover creators, businesses and profiles.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
