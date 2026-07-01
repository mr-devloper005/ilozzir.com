import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  const stats = pagesContent.about.stats
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; {pagesContent.about.badge}</p>
            <h1 className="editable-display mt-8 max-w-4xl text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl lg:text-[9rem]">
              About<br />
              <span className="text-[var(--slot4-accent)]">{SITE_CONFIG.name}</span>.
            </h1>
            <p className="mt-10 max-w-2xl text-xl leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
          </div>
        </section>

        {/* Story / Paragraphs */}
        <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-24 sm:py-32">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-14 lg:grid-cols-[0.4fr_1fr]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 002 &nbsp;— &nbsp; The story</p>
              <div className="space-y-8 text-lg leading-8 text-[var(--slot4-muted-text)] sm:text-xl">
                {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[var(--slot4-page-bg)] py-24 sm:py-32">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-14 lg:grid-cols-[0.4fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 003 &nbsp;— &nbsp; What we value</p>
                <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl">
                  Principles<br />that guide us.
                </h2>
              </div>
              <div className="grid gap-4">
                {pagesContent.about.values.map((value, index) => (
                  <EditableReveal key={value.title} delay={index * 90}>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-6 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 transition hover:border-[var(--slot4-accent)]/40">
                      <span className="editable-display text-4xl font-black leading-none tracking-[-0.03em] text-[var(--slot4-accent)] sm:text-5xl">
                        /{String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="editable-display text-2xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{value.title}</h3>
                        <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                      </div>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        {stats?.length ? (
          <section className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
            <div className="mx-auto max-w-[var(--editable-container)] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] opacity-60">/ 004 &nbsp;— &nbsp; By the numbers</p>
              <div className="mt-14 grid gap-6 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <EditableReveal key={stat.label} delay={i * 90}>
                    <div className="border-t border-[var(--slot4-dark-text)]/15 pt-8">
                      <p className="editable-display text-6xl font-black leading-none tracking-[-0.045em] sm:text-7xl lg:text-8xl">
                        {stat.value}
                      </p>
                      <p className="mt-4 text-sm font-medium opacity-70">{stat.label}</p>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}
