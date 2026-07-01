import type { CSSProperties } from 'react'

export const editableRootStyle = {
  // Cinematic "Arlox" system: near-black warm base, cream text, vibrant lime
  // accent. Strategic light inversion sections (`--slot4-dark-*`) provide
  // rhythm. Big rounded corners, oversized display type, minimal chrome.
  '--slot4-page-bg': '#0F0E0C',
  '--slot4-page-text': '#F1EDE4',
  '--slot4-panel-bg': '#161512',
  '--slot4-surface-bg': '#1B1A17',
  '--slot4-muted-text': '#9A968D',
  '--slot4-soft-muted-text': '#6B685F',
  '--slot4-accent': '#E8FF5C',
  '--slot4-accent-fill': '#E8FF5C',
  '--slot4-accent-soft': '#2A2E1A',
  '--slot4-on-accent': '#0F0E0C',
  '--slot4-dark-bg': '#F1EDE4',
  '--slot4-dark-text': '#0F0E0C',
  '--slot4-media-bg': '#221F1B',
  '--slot4-cream': '#F1EDE4',
  '--slot4-warm': '#161512',
  '--slot4-lavender': '#1B1A17',
  '--slot4-gray': '#161512',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#0F0E0C',
  '--editable-page-text': '#F1EDE4',
  '--editable-container': '1400px',
  '--editable-border': 'rgba(241,237,228,0.10)',
  '--editable-nav-bg': 'rgba(15,14,12,0.82)',
  '--editable-nav-text': '#F1EDE4',
  '--editable-nav-active': '#E8FF5C',
  '--editable-nav-active-text': '#0F0E0C',
  '--editable-cta-bg': '#E8FF5C',
  '--editable-cta-text': '#0F0E0C',
  '--editable-search-bg': '#161512',
  '--editable-footer-bg': '#0F0E0C',
  '--editable-footer-text': '#F1EDE4',
  '--editable-radius-pill': '999px',
  '--editable-shadow': '0 2px 8px rgba(0,0,0,0.28)',
  '--editable-shadow-lift': '0 24px 60px rgba(0,0,0,0.45)',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-black/10',
  shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
  shadowStrong: 'shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.82))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12',
    sectionY: 'py-20 sm:py-28 lg:py-32',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[220px] shrink-0 snap-start sm:w-[280px]',
  },
  type: {
    eyebrow: 'text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]',
    heroTitle: 'editable-display text-6xl font-black leading-[0.92] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[10rem]',
    sectionTitle: 'editable-display text-5xl font-black tracking-[-0.035em] sm:text-6xl lg:text-7xl',
    body: 'text-base leading-relaxed text-[var(--slot4-muted-text)]',
  },
  surface: {
    card: `rounded-[2rem] border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    soft: `rounded-[2rem] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[2rem] ${editablePalette.darkBg} ${editablePalette.darkText}`,
  },
  button: {
    primary: `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-on-accent)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    secondary: `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-transparent px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] active:scale-[0.98]`,
    accent: `inline-flex items-center justify-center gap-2 rounded-full ${editablePalette.accentBg} px-7 py-3.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]`,
  },
  media: {
    frame: `relative overflow-hidden rounded-[2rem] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1',
    fade: 'transition duration-300 hover:opacity-80',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; all homepage sections consume those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so AI can redesign the whole home experience in one file.',
  'Use wide readable grids; never create skinny columns for paragraphs or cards.',
  'Use horizontal rails for dense post browsing.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
