'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const brand = SITE_CONFIG.name.toUpperCase()

  return (
    <footer className="relative overflow-hidden bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* Top CTA band */}
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto max-w-[var(--editable-container)] px-5 py-24 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ Join {SITE_CONFIG.name}</p>
              <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-8xl">
                Ready to<br />
                <span className="text-[var(--slot4-accent)]">get listed?</span>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <Link
                href="/create"
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--slot4-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:scale-[1.02]"
              >
                Start now
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-4 text-sm font-semibold text-[var(--editable-footer-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                Contact us <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--slot4-accent)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
              </span>
              <span className="editable-display text-xl font-black uppercase tracking-[-0.02em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[var(--slot4-muted-text)]">
              A modern directory for local businesses and community bookmarks. Discover, save, and share the best of both.
            </p>
            
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">Explore</h3>
            <div className="mt-5">
           <Link href="/create" className="group inline-flex items-center gap-2 text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
              Add your business
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
            </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">Site</h3>
            <div className="mt-5 grid gap-3">
              {[['About', '/about'], ['Contact', '/contact'], ['Search', '/search']].map(([label, href]) => (
                <Link key={href} href={href} className="group inline-flex items-center gap-2 text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">Account</h3>
            <div className="mt-5 grid gap-3">
              {session ? (
                <>
                  <Link href="/create" className="group inline-flex items-center gap-2 text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
                    Create <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                  <button type="button" onClick={logout} className="text-left text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="group inline-flex items-center gap-2 text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
                    Sign in <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                  <Link href="/signup" className="group inline-flex items-center gap-2 text-base font-medium text-[var(--editable-footer-text)] transition hover:text-[var(--slot4-accent)]">
                    Sign up <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Massive brand marquee */}
      <div className="overflow-hidden border-t border-[var(--editable-border)] py-8">
        <div className="editable-marquee-track flex w-max items-center gap-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-12">
              <span className="editable-display text-[6rem] font-black leading-none tracking-[-0.045em] text-[var(--editable-footer-text)] opacity-90 sm:text-[9rem] lg:text-[12rem]">
                {brand}
              </span>
              <span className="h-4 w-4 shrink-0 rounded-full bg-[var(--slot4-accent)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-start justify-between gap-3 px-5 py-6 text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span>Made with ♥ for local discovery</span>
        </div>
      </div>
    </footer>
  )
}
